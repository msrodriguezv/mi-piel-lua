import { Anticipo } from './Anticipo';
import { CodigoPromocion } from './CodigoPromocion';
import { Servicio } from './Servicio';

export type EstadoCita = 'pendiente_anticipo' | 'confirmada' | 'realizada' | 'cancelada';

/**
 * Entidad Cita (raíz de agregado del contexto Citas).
 * Reglas: se confirma solo con anticipo; una primera cita exige
 * el consentimiento informado firmado antes de realizarse.
 */
export class Cita {
  private _estado: EstadoCita = 'pendiente_anticipo';
  private _anticipo: Anticipo | null = null;

  constructor(
    readonly id: string,
    readonly servicio: Servicio,
    readonly fechaHora: Date,
    readonly esPrimeraCita: boolean,
    readonly codigo: CodigoPromocion | null = null,
  ) {}

  get estado(): EstadoCita { return this._estado; }
  get anticipo(): Anticipo | null { return this._anticipo; }

  pagarAnticipo(anticipo: Anticipo): void {
    if (this._estado !== 'pendiente_anticipo') {
      throw new Error('Esta cita ya no espera un anticipo.');
    }
    this._anticipo = anticipo;
    this._estado = 'confirmada';
  }

  marcarRealizada(consentimientoFirmado: boolean): void {
    if (this._estado !== 'confirmada') throw new Error('Solo una cita confirmada puede realizarse.');
    if (this.esPrimeraCita && !consentimientoFirmado) {
      throw new Error('Falta el consentimiento informado firmado para la primera cita.');
    }
    this._estado = 'realizada';
  }

  cancelar(): void {
    if (this._estado === 'realizada') throw new Error('No se puede cancelar una cita realizada.');
    this._estado = 'cancelada';
  }
}
