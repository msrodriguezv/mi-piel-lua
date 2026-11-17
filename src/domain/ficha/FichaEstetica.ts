/**
 * Contexto Ficha Estética (panel de la especialista).
 * Contiene datos sensibles (salud): solo se crea con consentimiento informado
 * y las fotos clínicas solo las ve la especialista.
 */
export type Rol = 'clienta' | 'especialista';

export interface ConsentimientoInformado {
  tratamiento: boolean;
  alergias: boolean;
  fotosClinicas: boolean;
  firmadoEn: Date;
}

export interface RegistroServicio {
  fecha: Date;
  servicioId: string;
  productosUsados: string[];
}

export interface FotoSesion {
  id: string;
  fecha: Date;
  uri: string;
}

export class FichaEstetica {
  private readonly historial: RegistroServicio[] = [];
  private readonly fotos: FotoSesion[] = [];

  constructor(
    readonly clientaId: string,
    readonly consentimiento: ConsentimientoInformado,
    readonly alergias: string[] = [],
  ) {
    if (!consentimiento.tratamiento) {
      throw new Error('Sin consentimiento del tratamiento no se puede abrir la ficha.');
    }
  }

  registrarServicio(registro: RegistroServicio): void {
    this.historial.push(registro);
  }

  agregarFoto(foto: FotoSesion): void {
    if (!this.consentimiento.fotosClinicas) {
      throw new Error('La clienta no autorizó fotos clínicas.');
    }
    this.fotos.push(foto);
  }

  /** Las fotos clínicas son privadas: solo la especialista puede verlas. */
  verFotos(rol: Rol): readonly FotoSesion[] {
    if (rol !== 'especialista') throw new Error('Solo la especialista puede ver las fotos clínicas.');
    return this.fotos;
  }

  verHistorial(): readonly RegistroServicio[] {
    return this.historial;
  }
}

/**
 * EN DESARROLLO: análisis facial con el equipo del spa + IA.
 * La IA solo sugiere; la especialista aprueba (Art. 20 de la LOPDP).
 */
export interface AnalisisFacial {
  fecha: Date;
  metricas: Record<string, number>; // se definirán según el analizador del local
  sugerenciaIA?: string;
  aprobadoPorEspecialista: boolean;
}
