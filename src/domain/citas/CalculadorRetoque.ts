import { Cita } from './Cita';

export interface VentanaRetoque {
  desde: Date;
  hasta: Date;
}

const DIA_MS = 24 * 60 * 60 * 1000;

/** Servicio de dominio: cuándo le toca el retoque según el servicio realizado. */
export function calcularVentanaRetoque(cita: Cita): VentanaRetoque | null {
  if (cita.estado !== 'realizada' || !cita.servicio.retoqueDias) return null;
  const base = cita.fechaHora.getTime();
  return {
    desde: new Date(base + cita.servicio.retoqueDias.min * DIA_MS),
    hasta: new Date(base + cita.servicio.retoqueDias.max * DIA_MS),
  };
}

export function diasHasta(fecha: Date, hoy: Date = new Date()): number {
  return Math.ceil((fecha.getTime() - hoy.getTime()) / DIA_MS);
}
