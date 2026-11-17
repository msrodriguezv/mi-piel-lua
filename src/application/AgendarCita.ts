import { Cita } from '../domain/citas/Cita';
import { CitaRepository, CodigoPromocionRepository } from '../domain/citas/CitaRepository';
import { buscarServicio } from '../domain/citas/Servicio';

export interface SolicitudCita {
  servicioId: string;
  fechaHora: Date;
  esPrimeraCita: boolean;
  codigoPromocion?: string;
}

/** Caso de uso: reservar una cita (queda pendiente hasta pagar el anticipo). */
export class AgendarCita {
  constructor(
    private readonly citas: CitaRepository,
    private readonly codigos: CodigoPromocionRepository,
    private readonly generarId: () => string = () => Math.random().toString(36).slice(2, 10),
  ) {}

  async ejecutar(solicitud: SolicitudCita, hoy: Date = new Date()): Promise<Cita> {
    if (solicitud.fechaHora.getTime() <= hoy.getTime()) {
      throw new Error('La cita debe ser en una fecha futura.');
    }
    const servicio = buscarServicio(solicitud.servicioId);
    let codigo = null;
    if (solicitud.codigoPromocion?.trim()) {
      codigo = await this.codigos.buscar(solicitud.codigoPromocion);
      if (!codigo || !codigo.estaVigente(hoy)) throw new Error('El código no existe o ya venció.');
    }
    const cita = new Cita(this.generarId(), servicio, solicitud.fechaHora, solicitud.esPrimeraCita, codigo);
    await this.citas.guardar(cita);
    return cita;
  }
}
