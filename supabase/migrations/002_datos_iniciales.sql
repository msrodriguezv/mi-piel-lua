-- =====================================================================
-- Mi Piel LÚA · Datos iniciales (ejecutar después de 001_esquema.sql)
-- La especialista puede editarlos luego desde su panel o desde Supabase.
-- =====================================================================

insert into public.servicios (id, nombre, duracion_min, precio, retoque_min, retoque_max) values
  ('pestanas-pelo-a-pelo', 'Pestañas pelo a pelo', 120, null, 14, 21),
  ('lifting',              'Lifting de pestañas',   60, null, 42, 56),
  ('laminado-cejas',       'Laminado de cejas',      60, null, 28, 42),
  ('limpieza-facial',      'Limpieza facial',        75, null, 28, 35)
on conflict (id) do nothing;

insert into public.codigos_promocion (codigo, porcentaje, vigente_hasta, publicacion) values
  ('LIFTING10', 10, '2027-12-31', 'Reel lifting de pestañas'),
  ('LUAPIEL15', 15, '2027-12-31', 'Post radar de tendencias')
on conflict (codigo) do nothing;

insert into public.tendencias (id, nombre, hashtag, pros, contras, evaluaciones, precauciones_fototipo, confiabilidad, validada) values
(
  'protector-solar-diario', 'Protector solar todos los días', '#sunscreen',
  array['Previene manchas y fotoenvejecimiento', 'Indispensable en Quito por la radiación UV alta'],
  array['Algunas fórmulas dejan brillo o residuo blanco'],
  '{"normal":{"estado":"funciona","nota":"Úsalo cada mañana y reaplica cada 2–3 horas al aire libre."},
    "seca":{"estado":"funciona","nota":"Elige texturas en crema con hidratantes."},
    "grasa":{"estado":"funciona","nota":"Prefiere fluidos oil-free o toque seco."},
    "mixta":{"estado":"funciona","nota":"Un fluido ligero equilibra zona T y mejillas."},
    "sensible":{"estado":"funciona","nota":"Mejor filtros minerales, sin perfume."}}',
  '{"I-II":"Tu piel se quema fácil: FPS 50+ y reaplicación estricta."}',
  'alta', true
),
(
  'retinol-noche', 'Retinol de noche', '#retinol',
  array['Mejora textura y líneas finas', 'Ayuda con poros y acné leve'],
  array['Irrita al inicio', 'Aumenta la sensibilidad al sol'],
  '{"normal":{"estado":"funciona","nota":"Empieza 2 noches por semana en baja concentración."},
    "seca":{"estado":"depende","nota":"Úsalo sobre hidratante (técnica sándwich)."},
    "grasa":{"estado":"funciona","nota":"Buen aliado para poros y textura."},
    "mixta":{"estado":"funciona","nota":"Introdúcelo poco a poco."},
    "sensible":{"estado":"evitalo","nota":"Consulta primero; hay alternativas más suaves como el bakuchiol."}}',
  '{"V-VI":"Si se irrita, puede dejar manchas oscuras: avanza lento."}',
  'media', true
),
(
  'acido-salicilico', 'Ácido salicílico (BHA)', '#salicylicacid',
  array['Destapa poros', 'Controla el brillo'],
  array['Puede resecar si se usa en exceso'],
  '{"normal":{"estado":"depende","nota":"Solo si tienes puntos negros ocasionales."},
    "seca":{"estado":"evitalo","nota":"Tiende a resecar más tu piel."},
    "grasa":{"estado":"funciona","nota":"2–3 veces por semana en la noche."},
    "mixta":{"estado":"funciona","nota":"Aplícalo solo en la zona T."},
    "sensible":{"estado":"evitalo","nota":"Puede irritar; consúltalo en cabina."}}',
  '{}',
  'alta', true
),
(
  'limon-en-la-cara', 'Limón directo en la cara', '#lemonskincare',
  array['Ninguno comprobado frente a alternativas seguras'],
  array['Puede causar quemaduras con el sol (fitofotodermatitis)', 'Mancha la piel'],
  '{"normal":{"estado":"evitalo","nota":"Usa vitamina C formulada en su lugar."},
    "seca":{"estado":"evitalo","nota":"Irrita y reseca."},
    "grasa":{"estado":"evitalo","nota":"No controla el brillo y daña la barrera."},
    "mixta":{"estado":"evitalo","nota":"Usa vitamina C formulada en su lugar."},
    "sensible":{"estado":"evitalo","nota":"Alto riesgo de reacción."}}',
  '{"III-IV":"Riesgo alto de manchas.","V-VI":"Riesgo alto de manchas."}',
  'alta', true
),
(
  'mascarilla-viral-sin-validar', 'Mascarilla viral (pendiente)', '#glassskin',
  '{}', '{}',
  '{"normal":{"estado":"depende","nota":""},"seca":{"estado":"depende","nota":""},
    "grasa":{"estado":"depende","nota":""},"mixta":{"estado":"depende","nota":""},
    "sensible":{"estado":"depende","nota":""}}',
  '{}',
  'baja', false
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Convertir tu cuenta en ESPECIALISTA (ejecutar después de registrarte
-- en la app). Cambia el correo por el tuyo:
--
--   update public.perfiles set rol = 'especialista'
--   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
-- ---------------------------------------------------------------------
