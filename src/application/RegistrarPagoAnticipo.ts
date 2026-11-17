import { Anticipo, MetodoPago } from '../domain/citas/Anticipo';
import { CitaRepository } from '../domain/citas/CitaRepository';

/** Caso de uso: registrar el anticipo (Deuna o transferencia) y confirmar la cita. */
export class RegistrarPagoAnticipo {
  constructor(private readonly citas: CitaRepository) {}

  async ejecutar(citaId: string, monto: number, metodo: MetodoPago): Promise<void> {
    const cita = (await this.citas.listar()).find((c) => c.id === citaId);
    if (!cita) throw new Error('Cita no encontrada.');
    cita.pagarAnticipo(Anticipo.registrar(monto, metodo));
    await this.citas.guardar(cita);
  }
}
