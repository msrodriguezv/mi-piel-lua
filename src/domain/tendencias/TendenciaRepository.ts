import { Tendencia } from './Tendencia';

/** Puerto del dominio: la infraestructura decide de dónde vienen las tendencias. */
export interface TendenciaRepository {
  listar(): Promise<Tendencia[]>;
}
