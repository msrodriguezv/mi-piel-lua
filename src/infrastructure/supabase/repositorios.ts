import { SupabaseClient } from '@supabase/supabase-js';
import { Cita } from '../../domain/citas/Cita';
import { CitaRepository, CodigoPromocionRepository, ServicioRepository } from '../../domain/citas/CitaRepository';
import { CodigoPromocion } from '../../domain/citas/CodigoPromocion';
import { Servicio } from '../../domain/citas/Servicio';
import { ClubRepository } from '../../domain/fidelizacion/ClubLua';
import { Tendencia } from '../../domain/tendencias/Tendencia';
import { TendenciaRepository } from '../../domain/tendencias/TendenciaRepository';
import { falla } from './cliente';
import { aCita, aCodigo, aServicio, aTendencia, FilaCita, FilaCodigo, FilaServicio, FilaTendencia, SELECT_CITA } from './mapeo';

export class CitaRepositorySupabase implements CitaRepository {
  constructor(private readonly db: SupabaseClient) {}

  async guardar(cita: Cita): Promise<void> {
    const cambios = {
      estado: cita.estado,
      anticipo_monto: cita.anticipo?.monto ?? null,
      anticipo_metodo: cita.anticipo?.metodo ?? null,
      anticipo_pagado_en: cita.anticipo?.pagadoEn.toISOString() ?? null,
    };
    // Primero intenta actualizar; si la cita no existe todavía, la crea.
    const { data, error } = await this.db.from('citas').update(cambios).eq('id', cita.id).select('id');
    falla(error);
    if (data && data.length > 0) return;

    const { error: errorAlCrear } = await this.db.from('citas').insert({
      id: cita.id,
      servicio_id: cita.servicio.id,
      fecha_hora: cita.fechaHora.toISOString(),
      es_primera_cita: cita.esPrimeraCita,
      codigo: cita.codigo?.codigo ?? null,
      estado: cita.estado,
    });
    falla(errorAlCrear);
  }

  async listar(): Promise<Cita[]> {
    const { data, error } = await this.db.from('citas').select(SELECT_CITA).order('fecha_hora');
    falla(error);
    return ((data ?? []) as unknown as FilaCita[]).map(aCita);
  }

  async buscar(id: string): Promise<Cita | null> {
    const { data, error } = await this.db.from('citas').select(SELECT_CITA).eq('id', id).maybeSingle();
    falla(error);
    return data ? aCita(data as unknown as FilaCita) : null;
  }

  async horariosOcupados(desde: Date, hasta: Date): Promise<Date[]> {
    const { data, error } = await this.db.rpc('horarios_ocupados', {
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
    });
    falla(error);
    return ((data ?? []) as string[]).map((f) => new Date(f));
  }
}

export class CodigoPromocionRepositorySupabase implements CodigoPromocionRepository {
  constructor(private readonly db: SupabaseClient) {}

  async buscar(codigo: string): Promise<CodigoPromocion | null> {
    const { data, error } = await this.db
      .from('codigos_promocion')
      .select('*')
      .eq('codigo', codigo.trim().toUpperCase())
      .eq('activo', true)
      .maybeSingle();
    falla(error);
    return data ? aCodigo(data as FilaCodigo) : null;
  }
}

export class ServicioRepositorySupabase implements ServicioRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listar(): Promise<Servicio[]> {
    const { data, error } = await this.db.from('servicios').select('*').eq('activo', true).order('nombre');
    falla(error);
    return ((data ?? []) as FilaServicio[]).map(aServicio);
  }

  async buscar(id: string): Promise<Servicio | null> {
    const { data, error } = await this.db.from('servicios').select('*').eq('id', id).maybeSingle();
    falla(error);
    return data ? aServicio(data as FilaServicio) : null;
  }
}

export class TendenciaRepositorySupabase implements TendenciaRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listar(): Promise<Tendencia[]> {
    const { data, error } = await this.db.from('tendencias').select('*').order('nombre');
    falla(error);
    return ((data ?? []) as FilaTendencia[]).map(aTendencia);
  }
}

export class ClubRepositorySupabase implements ClubRepository {
  constructor(private readonly db: SupabaseClient) {}

  async saldo(): Promise<number> {
    const { data: sesion } = await this.db.auth.getUser();
    if (!sesion.user) return 0;
    const { data, error } = await this.db.from('movimientos_club').select('puntos').eq('clienta_id', sesion.user.id);
    falla(error);
    return ((data ?? []) as { puntos: number }[]).reduce((total, m) => total + m.puntos, 0);
  }
}
