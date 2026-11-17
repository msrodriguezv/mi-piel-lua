/**
 * Servicio del spa con su intervalo de retoque recomendado (en días).
 * Los intervalos son configurables por la especialista.
 */
export interface Servicio {
  id: string;
  nombre: string;
  duracionMin: number;
  precio: number | null; // null = precio por definir
  retoqueDias: { min: number; max: number } | null;
}

export const CATALOGO_SERVICIOS: readonly Servicio[] = [
  { id: 'pestanas-pelo-a-pelo', nombre: 'Pestañas pelo a pelo', duracionMin: 120, precio: null, retoqueDias: { min: 14, max: 21 } },
  { id: 'lifting', nombre: 'Lifting de pestañas', duracionMin: 60, precio: null, retoqueDias: { min: 42, max: 56 } },
  { id: 'laminado-cejas', nombre: 'Laminado de cejas', duracionMin: 60, precio: null, retoqueDias: { min: 28, max: 42 } },
  { id: 'limpieza-facial', nombre: 'Limpieza facial', duracionMin: 75, precio: null, retoqueDias: { min: 28, max: 35 } },
];

export function buscarServicio(id: string): Servicio {
  const servicio = CATALOGO_SERVICIOS.find((s) => s.id === id);
  if (!servicio) throw new Error(`Servicio no encontrado: ${id}`);
  return servicio;
}
