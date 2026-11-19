import { Anticipo, MetodoPago } from '../../domain/citas/Anticipo';
import { Cita, EstadoCita } from '../../domain/citas/Cita';
import { CodigoPromocion } from '../../domain/citas/CodigoPromocion';
import { Servicio } from '../../domain/citas/Servicio';
import { DatosTendencia, Tendencia } from '../../domain/tendencias/Tendencia';

/** Filas tal como las devuelve la base de datos (nombres en snake_case). */
export interface FilaServicio {
  id: string;
  nombre: string;
  duracion_min: number;
  precio: number | string | null;
  retoque_min: number | null;
  retoque_max: number | null;
}

export interface FilaCodigo {
  codigo: string;
  porcentaje: number;
  vigente_hasta: string;
  publicacion: string;
}

export interface FilaCita {
  id: string;
  clienta_id: string;
  servicio_id: string;
  fecha_hora: string;
  es_primera_cita: boolean;
  codigo: string | null;
  estado: EstadoCita;
  anticipo_monto: number | string | null;
  anticipo_metodo: MetodoPago | null;
  anticipo_pagado_en: string | null;
  servicios: FilaServicio;
  codigos_promocion: FilaCodigo | null;
}

export interface FilaTendencia {
  id: string;
  nombre: string;
  hashtag: string;
  pros: string[];
  contras: string[];
  evaluaciones: DatosTendencia['evaluaciones'];
  precauciones_fototipo: DatosTendencia['precaucionesFototipo'];
  confiabilidad: DatosTendencia['confiabilidad'];
  validada: boolean;
}

/** Consulta de citas con su servicio y su código incluidos. */
export const SELECT_CITA = '*, servicios(*), codigos_promocion(*)';

export function aServicio(f: FilaServicio): Servicio {
  return {
    id: f.id,
    nombre: f.nombre,
    duracionMin: f.duracion_min,
    precio: f.precio === null ? null : Number(f.precio),
    retoqueDias: f.retoque_min !== null && f.retoque_max !== null ? { min: f.retoque_min, max: f.retoque_max } : null,
  };
}

export function aCodigo(f: FilaCodigo): CodigoPromocion {
  return CodigoPromocion.crear(f.codigo, f.porcentaje, new Date(`${f.vigente_hasta}T23:59:59`), f.publicacion);
}

export function aCita(f: FilaCita): Cita {
  return Cita.reconstituir({
    id: f.id,
    servicio: aServicio(f.servicios),
    fechaHora: new Date(f.fecha_hora),
    esPrimeraCita: f.es_primera_cita,
    codigo: f.codigos_promocion ? aCodigo(f.codigos_promocion) : null,
    estado: f.estado,
    anticipo:
      f.anticipo_monto !== null && f.anticipo_metodo
        ? Anticipo.registrar(Number(f.anticipo_monto), f.anticipo_metodo, new Date(f.anticipo_pagado_en ?? f.fecha_hora))
        : null,
  });
}

export function aTendencia(f: FilaTendencia): Tendencia {
  return Tendencia.crear({
    id: f.id,
    nombre: f.nombre,
    hashtag: f.hashtag,
    pros: f.pros ?? [],
    contras: f.contras ?? [],
    evaluaciones: f.evaluaciones,
    precaucionesFototipo: f.precauciones_fototipo ?? {},
    confiabilidad: f.confiabilidad,
    validadaPorEspecialista: f.validada,
  });
}
