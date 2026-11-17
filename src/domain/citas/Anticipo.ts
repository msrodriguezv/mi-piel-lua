export type MetodoPago = 'deuna' | 'transferencia';

/** Objeto de valor: anticipo para reservar una cita. Se descuenta del total. */
export class Anticipo {
  private constructor(
    readonly monto: number,
    readonly metodo: MetodoPago,
    readonly pagadoEn: Date,
  ) {}

  static registrar(monto: number, metodo: MetodoPago, pagadoEn: Date = new Date()): Anticipo {
    if (!Number.isFinite(monto) || monto <= 0) {
      throw new Error('El anticipo debe ser mayor que cero.');
    }
    return new Anticipo(Math.round(monto * 100) / 100, metodo, pagadoEn);
  }
}
