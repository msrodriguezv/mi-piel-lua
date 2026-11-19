-- =====================================================================
-- Mi Piel LÚA · Esquema de base de datos (Supabase / PostgreSQL)
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este
-- archivo → Run. Se puede ejecutar una sola vez en un proyecto nuevo.
--
-- Privacidad (LOPDP Ecuador):
--   · El biotipo y el fototipo NO se guardan aquí: viven solo en el teléfono.
--   · Las fichas y las fotos clínicas solo las ve la especialista (RLS).
--   · Las tendencias son datos agregados, sin datos de personas.
-- =====================================================================

-- ---------- Tipos ----------------------------------------------------
create type public.rol_usuario as enum ('clienta', 'especialista');
create type public.estado_cita as enum ('pendiente_anticipo', 'confirmada', 'realizada', 'cancelada');
create type public.metodo_pago as enum ('deuna', 'transferencia');

-- ---------- Perfiles (uno por usuaria de Supabase Auth) ---------------
create table public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null default '',
  rol        public.rol_usuario not null default 'clienta',
  creado_en  timestamptz not null default now()
);

-- Crea el perfil automáticamente cuando alguien se registra.
create function public.crear_perfil_nuevo()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', ''));
  return new;
end;
$$;

create trigger al_registrar_usuaria
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo();

-- ¿La usuaria actual es la especialista?
create function public.es_especialista()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'especialista');
$$;

-- ---------- Catálogo de servicios ------------------------------------
create table public.servicios (
  id           text primary key,
  nombre       text not null,
  duracion_min int  not null check (duracion_min > 0),
  precio       numeric(10, 2),
  retoque_min  int,
  retoque_max  int,
  activo       boolean not null default true,
  check (retoque_min is null or retoque_max >= retoque_min)
);

-- ---------- Códigos de promoción -------------------------------------
create table public.codigos_promocion (
  codigo        text primary key check (codigo ~ '^[A-Z0-9]{3,20}$'),
  porcentaje    int  not null check (porcentaje between 1 and 100),
  vigente_hasta date not null,
  publicacion   text not null,
  activo        boolean not null default true
);

-- ---------- Citas ----------------------------------------------------
create table public.citas (
  id                 uuid primary key default gen_random_uuid(),
  clienta_id         uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  servicio_id        text not null references public.servicios (id),
  fecha_hora         timestamptz not null,
  es_primera_cita    boolean not null default false,
  codigo             text references public.codigos_promocion (codigo),
  estado             public.estado_cita not null default 'pendiente_anticipo',
  anticipo_monto     numeric(10, 2) check (anticipo_monto is null or anticipo_monto > 0),
  anticipo_metodo    public.metodo_pago,
  anticipo_pagado_en timestamptz,
  creada_en          timestamptz not null default now()
);

create index citas_clienta_idx on public.citas (clienta_id);
create index citas_fecha_idx on public.citas (fecha_hora);

-- Un solo horario por cita activa (una especialista, una cabina).
create unique index citas_horario_unico
  on public.citas (fecha_hora)
  where estado in ('pendiente_anticipo', 'confirmada');

-- ---------- Tendencias (datos agregados) ------------------------------
create table public.tendencias (
  id                    text primary key,
  nombre                text not null,
  hashtag               text not null,
  pros                  text[] not null default '{}',
  contras               text[] not null default '{}',
  evaluaciones          jsonb  not null,  -- { "normal": {"estado","nota"}, ... }
  precauciones_fototipo jsonb  not null default '{}'::jsonb,
  confiabilidad         text   not null check (confiabilidad in ('alta', 'media', 'baja', 'insuficiente')),
  validada              boolean not null default false,
  actualizada_en        timestamptz not null default now()
);

-- ---------- Ficha estética (solo especialista) ------------------------
create table public.fichas_esteticas (
  clienta_id                 uuid primary key references public.perfiles (id) on delete cascade,
  alergias                   text[] not null default '{}',
  consentimiento_tratamiento boolean not null default false,
  consentimiento_alergias    boolean not null default false,
  consentimiento_fotos       boolean not null default false,
  consentimiento_firmado_en  timestamptz,
  notas                      text not null default '',
  actualizada_en             timestamptz not null default now()
);

create table public.fotos_sesion (
  id         uuid primary key default gen_random_uuid(),
  clienta_id uuid not null references public.perfiles (id) on delete cascade,
  ruta       text not null,              -- ruta dentro del bucket privado "fotos-clinicas"
  fecha      timestamptz not null default now()
);

-- ---------- Club LÚA (puntos) ----------------------------------------
create table public.movimientos_club (
  id         uuid primary key default gen_random_uuid(),
  clienta_id uuid not null references public.perfiles (id) on delete cascade,
  motivo     text not null,
  puntos     int  not null,
  cita_id    uuid references public.citas (id) on delete set null,
  creado_en  timestamptz not null default now()
);

-- =====================================================================
-- Reglas de negocio que también protege la base de datos
-- =====================================================================

-- La clienta solo puede: pagar el anticipo (pendiente → confirmada) o cancelar.
-- La especialista puede marcar como realizada, pero la primera cita exige
-- el consentimiento informado firmado.
create function public.validar_cambio_cita()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.es_especialista() then
    if new.clienta_id <> old.clienta_id or new.servicio_id <> old.servicio_id
       or new.fecha_hora <> old.fecha_hora or new.es_primera_cita <> old.es_primera_cita
       or new.codigo is distinct from old.codigo then
      raise exception 'Solo se puede pagar el anticipo o cancelar la cita.';
    end if;

    if new.estado <> old.estado then
      if old.estado = 'pendiente_anticipo' and new.estado = 'confirmada' then
        if new.anticipo_monto is null or new.anticipo_metodo is null then
          raise exception 'La cita se confirma solo con anticipo.';
        end if;
      elsif new.estado = 'cancelada' and old.estado in ('pendiente_anticipo', 'confirmada') then
        null;
      else
        raise exception 'Cambio de estado no permitido.';
      end if;
    end if;
  end if;

  if new.estado = 'realizada' and old.estado <> 'realizada' then
    if old.estado <> 'confirmada' then
      raise exception 'Solo una cita confirmada puede realizarse.';
    end if;
    if new.es_primera_cita and not exists (
      select 1 from public.fichas_esteticas f
      where f.clienta_id = new.clienta_id and f.consentimiento_tratamiento
    ) then
      raise exception 'Falta el consentimiento informado firmado para la primera cita.';
    end if;
  end if;

  return new;
end;
$$;

create trigger antes_de_actualizar_cita
  before update on public.citas
  for each row execute function public.validar_cambio_cita();

-- Las citas nuevas siempre nacen pendientes de anticipo y en el futuro.
create function public.validar_cita_nueva()
returns trigger language plpgsql as $$
begin
  if new.fecha_hora <= now() then
    raise exception 'La cita debe ser en una fecha futura.';
  end if;
  if new.codigo is not null and not exists (
    select 1 from public.codigos_promocion c
    where c.codigo = new.codigo and c.activo and c.vigente_hasta >= current_date
  ) then
    raise exception 'El código no existe o ya venció.';
  end if;
  return new;
end;
$$;

create trigger antes_de_insertar_cita
  before insert on public.citas
  for each row execute function public.validar_cita_nueva();

-- Puntos del Club LÚA al realizar un servicio (+15 si fue un retoque a tiempo).
create function public.sumar_puntos_club()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  previa  timestamptz;
  srv     public.servicios%rowtype;
begin
  if new.estado = 'realizada' and old.estado <> 'realizada' then
    insert into public.movimientos_club (clienta_id, motivo, puntos, cita_id)
    values (new.clienta_id, 'Servicio realizado', 10, new.id);

    select * into srv from public.servicios where id = new.servicio_id;
    select max(fecha_hora) into previa from public.citas
      where clienta_id = new.clienta_id and servicio_id = new.servicio_id
        and estado = 'realizada' and id <> new.id and fecha_hora < new.fecha_hora;

    if previa is not null and srv.retoque_min is not null
       and new.fecha_hora between previa + make_interval(days => srv.retoque_min)
                              and previa + make_interval(days => srv.retoque_max) then
      insert into public.movimientos_club (clienta_id, motivo, puntos, cita_id)
      values (new.clienta_id, 'Retoque a tiempo', 15, new.id);
    end if;
  end if;
  return new;
end;
$$;

create trigger despues_de_realizar_cita
  after update on public.citas
  for each row execute function public.sumar_puntos_club();

-- Horarios ocupados para el calendario, sin exponer datos de otras clientas.
create function public.horarios_ocupados(desde timestamptz, hasta timestamptz)
returns setof timestamptz language sql stable security definer set search_path = public as $$
  select fecha_hora from public.citas
  where fecha_hora between desde and hasta
    and estado in ('pendiente_anticipo', 'confirmada');
$$;

-- =====================================================================
-- Seguridad por fila (RLS)
-- =====================================================================
alter table public.perfiles          enable row level security;
alter table public.servicios         enable row level security;
alter table public.codigos_promocion enable row level security;
alter table public.citas             enable row level security;
alter table public.tendencias        enable row level security;
alter table public.fichas_esteticas  enable row level security;
alter table public.fotos_sesion      enable row level security;
alter table public.movimientos_club  enable row level security;

-- Perfiles: cada una ve el suyo; la especialista ve todos.
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_especialista());
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = auth.uid());
-- Nadie puede cambiarse el rol a sí misma desde la app.
revoke update on public.perfiles from authenticated, anon;
grant update (nombre) on public.perfiles to authenticated;

-- Servicios: catálogo público; los gestiona la especialista.
create policy servicios_ver on public.servicios for select to anon, authenticated
  using (activo or public.es_especialista());
create policy servicios_gestionar on public.servicios for all to authenticated
  using (public.es_especialista()) with check (public.es_especialista());

-- Códigos: las clientas pueden validarlos; los gestiona la especialista.
create policy codigos_ver on public.codigos_promocion for select to authenticated
  using (true);
create policy codigos_gestionar on public.codigos_promocion for all to authenticated
  using (public.es_especialista()) with check (public.es_especialista());

-- Citas: cada clienta las suyas; la especialista todas.
create policy citas_ver on public.citas for select to authenticated
  using (clienta_id = auth.uid() or public.es_especialista());
create policy citas_crear on public.citas for insert to authenticated
  with check (clienta_id = auth.uid() and estado = 'pendiente_anticipo');
create policy citas_actualizar on public.citas for update to authenticated
  using (clienta_id = auth.uid() or public.es_especialista());

-- Tendencias: las clientas solo ven las validadas y confiables.
create policy tendencias_ver on public.tendencias for select to anon, authenticated
  using ((validada and confiabilidad <> 'baja') or public.es_especialista());
create policy tendencias_gestionar on public.tendencias for all to authenticated
  using (public.es_especialista()) with check (public.es_especialista());

-- Ficha estética y fotos: solo la especialista.
create policy fichas_especialista on public.fichas_esteticas for all to authenticated
  using (public.es_especialista()) with check (public.es_especialista());
create policy fotos_especialista on public.fotos_sesion for all to authenticated
  using (public.es_especialista()) with check (public.es_especialista());

-- Club LÚA: cada clienta ve sus puntos; los suma la base de datos.
create policy club_ver on public.movimientos_club for select to authenticated
  using (clienta_id = auth.uid() or public.es_especialista());

-- =====================================================================
-- Almacenamiento privado de fotos clínicas
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('fotos-clinicas', 'fotos-clinicas', false)
on conflict (id) do nothing;

create policy fotos_clinicas_ver on storage.objects for select to authenticated
  using (bucket_id = 'fotos-clinicas' and public.es_especialista());
create policy fotos_clinicas_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos-clinicas' and public.es_especialista());
create policy fotos_clinicas_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'fotos-clinicas' and public.es_especialista());
