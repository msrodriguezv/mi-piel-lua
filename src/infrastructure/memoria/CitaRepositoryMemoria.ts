import { Cita } from '../../domain/citas/Cita';
import { CitaRepository, CodigoPromocionRepository } from '../../domain/citas/CitaRepository';
import { CodigoPromocion } from '../../domain/citas/CodigoPromocion';

export class CitaRepositoryMemoria implements CitaRepository {
  private readonly citas = new Map<string, Cita>();

  async guardar(cita: Cita): Promise<void> {
    this.citas.set(cita.id, cita);
  }

  async listar(): Promise<Cita[]> {
    return [...this.citas.values()].sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
  }
}

export class CodigoPromocionRepositoryMemoria implements CodigoPromocionRepository {
  constructor(private readonly codigos: CodigoPromocion[]) {}

  async buscar(codigo: string): Promise<CodigoPromocion | null> {
    const normalizado = codigo.trim().toUpperCase();
    return this.codigos.find((c) => c.codigo === normalizado) ?? null;
  }
}
