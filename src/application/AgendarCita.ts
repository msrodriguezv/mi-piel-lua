import { generarId } from '../domain/compartido/generarId';
import { Cita } from '../domain/citas/Cita';
import { CitaRepository, CodigoPromocionRepository, ServicioRepository } from '../domain/citas/CitaRepository';

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
    private readonly servicios: ServicioRepository,
    private readonly nuevoId: () => string = generarId,
  ) {}

  async ejecutar(solicitud: SolicitudCita, hoy: Date = new Date()): Promise<Cita> {
    if (solicitud.fechaHora.getTime() <= hoy.getTime()) {
      throw new Error('La cita debe ser en una fecha futura.');
    }
    const servicio = await this.servicios.buscar(solicitud.servicioId);
    if (!servicio) throw new Error('El servicio no está disponible.');

    const ocupados = await this.citas.horariosOcupados(solicitud.fechaHora, solicitud.fechaHora);
    if (ocupados.some((f) => f.getTime() === solicitud.fechaHora.getTime())) {
      throw new Error('Ese horario ya está reservado. Elige otro.');
    }

    let codigo = null;
    if (solicitud.codigoPromocion?.trim()) {
      codigo = await this.codigos.buscar(solicitud.codigoPromocion);
      if (!codigo || !codigo.estaVigente(hoy)) throw new Error('El código no existe o ya venció.');
    }
    const cita = new Cita(this.nuevoId(), servicio, solicitud.fechaHora, solicitud.esPrimeraCita, codigo);
    await this.citas.guardar(cita);
    return cita;
  }
}
