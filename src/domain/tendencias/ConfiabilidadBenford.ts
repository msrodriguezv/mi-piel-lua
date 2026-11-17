/**
 * Servicio de dominio: confiabilidad de una tendencia según la Ley de Benford.
 *
 * Toma números de la tendencia (vistas, likes, guardados de muchos videos)
 * y compara la frecuencia del primer dígito con la esperada por Benford.
 * Usa la desviación absoluta media (MAD) con los umbrales de Nigrini
 * para primer dígito: <= 0,006 conformidad cercana; <= 0,012 aceptable;
 * <= 0,015 marginal; > 0,015 no conforme (posible inflado por bots).
 */
export type NivelConfiabilidad = 'alta' | 'media' | 'baja' | 'insuficiente';

export interface ResultadoBenford {
  nivel: NivelConfiabilidad;
  mad: number | null;
  muestra: number;
}

export const MUESTRA_MINIMA = 50;

const ESPERADO: readonly number[] = Array.from({ length: 9 }, (_, i) => Math.log10(1 + 1 / (i + 1)));

function primerDigito(valor: number): number | null {
  if (!Number.isFinite(valor) || valor < 1) return null;
  const digito = Number(String(Math.floor(valor))[0]);
  return digito >= 1 && digito <= 9 ? digito : null;
}

export function evaluarConfiabilidad(valores: readonly number[]): ResultadoBenford {
  const digitos = valores.map(primerDigito).filter((d): d is number => d !== null);
  const muestra = digitos.length;
  if (muestra < MUESTRA_MINIMA) return { nivel: 'insuficiente', mad: null, muestra };

  const conteo = new Array<number>(9).fill(0);
  for (const d of digitos) conteo[d - 1] += 1;

  const mad = conteo.reduce((suma, c, i) => suma + Math.abs(c / muestra - ESPERADO[i]), 0) / 9;

  let nivel: NivelConfiabilidad;
  if (mad <= 0.012) nivel = 'alta';
  else if (mad <= 0.015) nivel = 'media';
  else nivel = 'baja';

  return { nivel, mad, muestra };
}
