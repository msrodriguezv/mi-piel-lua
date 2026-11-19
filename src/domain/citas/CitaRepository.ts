import { Cita } from './Cita';
import { CodigoPromocion } from './CodigoPromocion';
import { Servicio } from './Servicio';

export interface CitaRepository {
  guardar(cita: Cita): Promise<void>;
  listar(): Promise<Cita[]>;
  buscar(id: string): Promise<Cita | null>;
  /** Horarios ya reservados, sin datos de otras clientas. */
  horariosOcupados(desde: Date, hasta: Date): Promise<Date[]>;
}

export interface CodigoPromocionRepository {
  buscar(codigo: string): Promise<CodigoPromocion | null>;
}

export interface ServicioRepository {
  listar(): Promise<Servicio[]>;
  buscar(id: string): Promise<Servicio | null>;
}
