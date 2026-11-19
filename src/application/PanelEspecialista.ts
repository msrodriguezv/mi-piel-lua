import { Cita } from '../domain/citas/Cita';
import { CitaRepository } from '../domain/citas/CitaRepository';
import { ConsentimientoInformado } from '../domain/ficha/FichaEstetica';
import { Tendencia } from '../domain/tendencias/Tendencia';

export interface CitaEnAgenda {
  cita: Cita;
  clientaId: string;
  clientaNombre: string;
}

export interface ClientaResumen {
  id: string;
  nombre: string;
}

export interface DatosFicha {
  alergias: string[];
  consentimiento: ConsentimientoInformado | null;
  notas: string;
}

export interface FotoClinica {
  id: string;
  fecha: Date;
  url: string; // enlace temporal y privado
}

/**
 * Puerto del panel de la especialista (modelo de lectura y escritura del back-office).
 * Toda la información sensible pasa por aquí, y la base de datos solo la entrega al rol especialista.
 */
export interface PanelEspecialistaRepository {
  agenda(desde: Date): Promise<CitaEnAgenda[]>;
  clientas(): Promise<ClientaResumen[]>;
  ficha(clientaId: string): Promise<DatosFicha>;
  guardarFicha(clientaId: string, datos: DatosFicha): Promise<void>;
  fotos(clientaId: string): Promise<FotoClinica[]>;
  subirFoto(clientaId: string, uriLocal: string): Promise<void>;
  tendencias(): Promise<Tendencia[]>;
  marcarTendencia(id: string, validada: boolean): Promise<void>;
}

/** Caso de uso: la especialista marca una cita como realizada (exige consentimiento en la primera). */
export class MarcarCitaRealizada {
  constructor(
    private readonly citas: CitaRepository,
    private readonly panel: PanelEspecialistaRepository,
  ) {}

  async ejecutar(citaId: string, clientaId: string): Promise<void> {
    const cita = await this.citas.buscar(citaId);
    if (!cita) throw new Error('Cita no encontrada.');
    const ficha = await this.panel.ficha(clientaId);
    cita.marcarRealizada(ficha.consentimiento?.tratamiento ?? false);
    await this.citas.guardar(cita);
  }
}

/** Caso de uso: la especialista cancela una cita. */
export class CancelarCita {
  constructor(private readonly citas: CitaRepository) {}

  async ejecutar(citaId: string): Promise<void> {
    const cita = await this.citas.buscar(citaId);
    if (!cita) throw new Error('Cita no encontrada.');
    cita.cancelar();
    await this.citas.guardar(cita);
  }
}

/** Caso de uso: subir una foto clínica, solo si la clienta autorizó fotos en su consentimiento. */
export class SubirFotoClinica {
  constructor(private readonly panel: PanelEspecialistaRepository) {}

  async ejecutar(clientaId: string, uriLocal: string): Promise<void> {
    const ficha = await this.panel.ficha(clientaId);
    if (!ficha.consentimiento?.fotosClinicas) {
      throw new Error('La clienta no autorizó fotos clínicas en su consentimiento.');
    }
    await this.panel.subirFoto(clientaId, uriLocal);
  }
}
