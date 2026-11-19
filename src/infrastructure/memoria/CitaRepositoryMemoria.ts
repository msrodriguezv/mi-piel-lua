import { Cita } from '../../domain/citas/Cita';
import { CitaRepository, CodigoPromocionRepository, ServicioRepository } from '../../domain/citas/CitaRepository';
import { CodigoPromocion } from '../../domain/citas/CodigoPromocion';
import { CATALOGO_SERVICIOS, Servicio } from '../../domain/citas/Servicio';
import { ClubRepository, PUNTOS_POR_SERVICIO } from '../../domain/fidelizacion/ClubLua';

/** Repositorios en memoria para el modo demostración (sin base de datos). */
export class CitaRepositoryMemoria implements CitaRepository {
  private readonly citas = new Map<string, Cita>();

  async guardar(cita: Cita): Promise<void> {
    this.citas.set(cita.id, cita);
  }

  async listar(): Promise<Cita[]> {
    return [...this.citas.values()].sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
  }

  async buscar(id: string): Promise<Cita | null> {
    return this.citas.get(id) ?? null;
  }

  async horariosOcupados(desde: Date, hasta: Date): Promise<Date[]> {
    return [...this.citas.values()]
      .filter((c) => (c.estado === 'pendiente_anticipo' || c.estado === 'confirmada')
        && c.fechaHora >= desde && c.fechaHora <= hasta)
      .map((c) => c.fechaHora);
  }
}

export class CodigoPromocionRepositoryMemoria implements CodigoPromocionRepository {
  constructor(private readonly codigos: CodigoPromocion[]) {}

  async buscar(codigo: string): Promise<CodigoPromocion | null> {
    const normalizado = codigo.trim().toUpperCase();
    return this.codigos.find((c) => c.codigo === normalizado) ?? null;
  }
}

export class ServicioRepositoryMemoria implements ServicioRepository {
  async listar(): Promise<Servicio[]> {
    return [...CATALOGO_SERVICIOS];
  }

  async buscar(id: string): Promise<Servicio | null> {
    return CATALOGO_SERVICIOS.find((s) => s.id === id) ?? null;
  }
}

export class ClubRepositoryMemoria implements ClubRepository {
  constructor(private readonly citas: CitaRepository) {}

  async saldo(): Promise<number> {
    const realizadas = (await this.citas.listar()).filter((c) => c.estado === 'realizada');
    return realizadas.length * PUNTOS_POR_SERVICIO;
  }
}
