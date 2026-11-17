import { Cita } from './Cita';
import { CodigoPromocion } from './CodigoPromocion';

export interface CitaRepository {
  guardar(cita: Cita): Promise<void>;
  listar(): Promise<Cita[]>;
}

export interface CodigoPromocionRepository {
  buscar(codigo: string): Promise<CodigoPromocion | null>;
}
