import { PerfilPiel } from '../domain/piel/PerfilPiel';
import { PRIORIDAD_SEMAFORO } from '../domain/tendencias/Semaforo';
import { ResultadoParaPerfil, Tendencia } from '../domain/tendencias/Tendencia';
import { TendenciaRepository } from '../domain/tendencias/TendenciaRepository';

export interface TendenciaParaMiPiel {
  tendencia: Tendencia;
  resultado: ResultadoParaPerfil;
}

/** Caso de uso: tendencias validadas, evaluadas para el perfil de la clienta. */
export class ObtenerTendenciasParaMiPiel {
  constructor(private readonly repo: TendenciaRepository) {}

  async ejecutar(perfil: PerfilPiel): Promise<TendenciaParaMiPiel[]> {
    const tendencias = await this.repo.listar();
    return tendencias
      .filter((t) => t.publicable)
      .map((tendencia) => ({ tendencia, resultado: tendencia.evaluarPara(perfil) }))
      .sort((a, b) => PRIORIDAD_SEMAFORO[a.resultado.estado] - PRIORIDAD_SEMAFORO[b.resultado.estado]);
  }
}
