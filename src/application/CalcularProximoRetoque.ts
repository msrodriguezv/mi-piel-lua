import { calcularVentanaRetoque, diasHasta, VentanaRetoque } from '../domain/citas/CalculadorRetoque';
import { CitaRepository } from '../domain/citas/CitaRepository';

export interface RecordatorioRetoque {
  servicio: string;
  ventana: VentanaRetoque;
  diasRestantes: number;
}

/** Caso de uso: recordatorios de retoque según el último servicio realizado. */
export class CalcularProximoRetoque {
  constructor(private readonly citas: CitaRepository) {}

  async ejecutar(hoy: Date = new Date()): Promise<RecordatorioRetoque[]> {
    const realizadas = (await this.citas.listar()).filter((c) => c.estado === 'realizada');
    const ultimaPorServicio = new Map<string, (typeof realizadas)[number]>();
    for (const cita of realizadas) {
      const previa = ultimaPorServicio.get(cita.servicio.id);
      if (!previa || cita.fechaHora > previa.fechaHora) ultimaPorServicio.set(cita.servicio.id, cita);
    }
    const recordatorios: RecordatorioRetoque[] = [];
    for (const cita of ultimaPorServicio.values()) {
      const ventana = calcularVentanaRetoque(cita);
      if (ventana) {
        recordatorios.push({ servicio: cita.servicio.nombre, ventana, diasRestantes: diasHasta(ventana.desde, hoy) });
      }
    }
    return recordatorios.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }
}
