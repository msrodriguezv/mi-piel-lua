/**
 * Objeto de valor: código de promoción medible (por ejemplo LIFTING10).
 * Cada publicación tiene su código, así el panel sabe qué promoción trajo cada cita.
 */
export class CodigoPromocion {
  private constructor(
    readonly codigo: string,
    readonly porcentaje: number,
    readonly vigenteHasta: Date,
    readonly publicacion: string,
  ) {}

  static crear(codigo: string, porcentaje: number, vigenteHasta: Date, publicacion: string): CodigoPromocion {
    const normalizado = codigo.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,20}$/.test(normalizado)) {
      throw new Error('El código debe tener de 3 a 20 letras o números, sin espacios.');
    }
    if (porcentaje <= 0 || porcentaje > 100) {
      throw new Error('El porcentaje debe estar entre 1 y 100.');
    }
    return new CodigoPromocion(normalizado, porcentaje, vigenteHasta, publicacion);
  }

  estaVigente(hoy: Date = new Date()): boolean {
    return hoy.getTime() <= this.vigenteHasta.getTime();
  }

  aplicarA(precio: number): number {
    return Math.round(precio * (1 - this.porcentaje / 100) * 100) / 100;
  }
}
