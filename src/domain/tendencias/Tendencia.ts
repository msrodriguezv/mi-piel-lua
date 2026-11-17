import { Biotipo } from '../piel/Biotipo';
import { GrupoFototipo } from '../piel/Fototipo';
import { PerfilPiel } from '../piel/PerfilPiel';
import { EstadoSemaforo } from './Semaforo';
import { NivelConfiabilidad } from './ConfiabilidadBenford';

export interface EvaluacionBiotipo {
  estado: EstadoSemaforo;
  nota: string;
}

export interface ResultadoParaPerfil {
  estado: EstadoSemaforo;
  nota: string;
  precaucionFototipo?: string;
}

export interface DatosTendencia {
  id: string;
  nombre: string;
  hashtag: string;
  pros: string[];
  contras: string[];
  evaluaciones: Record<Biotipo, EvaluacionBiotipo>;
  precaucionesFototipo: Partial<Record<GrupoFototipo, string>>;
  confiabilidad: NivelConfiabilidad;
  validadaPorEspecialista: boolean;
}

/**
 * Entidad Tendencia: un producto, rutina o tratamiento viral,
 * evaluado por la especialista para cada biotipo y fototipo.
 * Guarda solo datos agregados de la tendencia, nunca de personas.
 */
export class Tendencia {
  private constructor(private readonly datos: DatosTendencia) {}

  static crear(datos: DatosTendencia): Tendencia {
    if (!datos.nombre.trim()) throw new Error('La tendencia necesita un nombre.');
    return new Tendencia({ ...datos, pros: [...datos.pros], contras: [...datos.contras] });
  }

  get id(): string { return this.datos.id; }
  get nombre(): string { return this.datos.nombre; }
  get hashtag(): string { return this.datos.hashtag; }
  get pros(): readonly string[] { return this.datos.pros; }
  get contras(): readonly string[] { return this.datos.contras; }
  get confiabilidad(): NivelConfiabilidad { return this.datos.confiabilidad; }

  /** Solo las tendencias revisadas por la especialista se muestran a las clientas. */
  get publicable(): boolean {
    return this.datos.validadaPorEspecialista && this.datos.confiabilidad !== 'baja';
  }

  evaluarPara(perfil: PerfilPiel): ResultadoParaPerfil {
    const evaluacion = this.datos.evaluaciones[perfil.biotipo];
    return {
      estado: evaluacion.estado,
      nota: evaluacion.nota,
      precaucionFototipo: this.datos.precaucionesFototipo[perfil.fototipo.grupo],
    };
  }
}
