/**
 * Fototipo de Fitzpatrick (I a VI): cómo reacciona la piel al sol.
 * Objeto de valor inmutable; solo acepta valores válidos.
 */
export type GrupoFototipo = 'I-II' | 'III-IV' | 'V-VI';

export class Fototipo {
  private constructor(readonly valor: 1 | 2 | 3 | 4 | 5 | 6) {}

  static crear(valor: number): Fototipo {
    if (!Number.isInteger(valor) || valor < 1 || valor > 6) {
      throw new Error(`Fototipo inválido: ${valor}. Debe ser un entero del 1 al 6.`);
    }
    return new Fototipo(valor as 1 | 2 | 3 | 4 | 5 | 6);
  }

  get grupo(): GrupoFototipo {
    if (this.valor <= 2) return 'I-II';
    if (this.valor <= 4) return 'III-IV';
    return 'V-VI';
  }

  get romano(): string {
    return ['I', 'II', 'III', 'IV', 'V', 'VI'][this.valor - 1];
  }

  equals(otro: Fototipo): boolean {
    return this.valor === otro.valor;
  }
}

export const GRUPOS_FOTOTIPO: ReadonlyArray<{ grupo: GrupoFototipo; representativo: number; descripcion: string }> = [
  { grupo: 'I-II', representativo: 2, descripcion: 'Siempre o casi siempre me quemo' },
  { grupo: 'III-IV', representativo: 3, descripcion: 'A veces me quemo, luego me bronceo' },
  { grupo: 'V-VI', representativo: 5, descripcion: 'Rara vez o nunca me quemo' },
];
