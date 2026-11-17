import { Tendencia, DatosTendencia } from '../../domain/tendencias/Tendencia';
import { TendenciaRepository } from '../../domain/tendencias/TendenciaRepository';

export class TendenciaRepositoryMemoria implements TendenciaRepository {
  constructor(private readonly datos: DatosTendencia[]) {}

  async listar(): Promise<Tendencia[]> {
    return this.datos.map((d) => Tendencia.crear(d));
  }
}
