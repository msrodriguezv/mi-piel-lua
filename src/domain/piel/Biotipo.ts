/** Biotipo cutáneo: cómo se comporta la piel en grasa e hidratación. */
export type Biotipo = 'normal' | 'seca' | 'grasa' | 'mixta' | 'sensible';

export const BIOTIPOS: ReadonlyArray<{ valor: Biotipo; etiqueta: string }> = [
  { valor: 'normal', etiqueta: 'Normal' },
  { valor: 'seca', etiqueta: 'Seca' },
  { valor: 'grasa', etiqueta: 'Grasa' },
  { valor: 'mixta', etiqueta: 'Mixta' },
  { valor: 'sensible', etiqueta: 'Sensible' },
];

export function esBiotipo(valor: string): valor is Biotipo {
  return BIOTIPOS.some((b) => b.valor === valor);
}
