import { SupabaseClient } from '@supabase/supabase-js';
import {
  CitaEnAgenda, ClientaResumen, DatosFicha, FotoClinica, PanelEspecialistaRepository,
} from '../../application/PanelEspecialista';
import { Tendencia } from '../../domain/tendencias/Tendencia';
import { falla } from './cliente';
import { aCita, aTendencia, FilaCita, FilaTendencia, SELECT_CITA } from './mapeo';

const BUCKET_FOTOS = 'fotos-clinicas';

interface FilaFicha {
  alergias: string[];
  consentimiento_tratamiento: boolean;
  consentimiento_alergias: boolean;
  consentimiento_fotos: boolean;
  consentimiento_firmado_en: string | null;
  notas: string;
}

export class PanelEspecialistaSupabase implements PanelEspecialistaRepository {
  constructor(private readonly db: SupabaseClient) {}

  async agenda(desde: Date): Promise<CitaEnAgenda[]> {
    const { data, error } = await this.db
      .from('citas')
      .select(`${SELECT_CITA}, perfiles(nombre)`)
      .gte('fecha_hora', desde.toISOString())
      .order('fecha_hora');
    falla(error);
    return ((data ?? []) as unknown as (FilaCita & { perfiles: { nombre: string } | null })[]).map((f) => ({
      cita: aCita(f),
      clientaId: f.clienta_id,
      clientaNombre: f.perfiles?.nombre || 'Clienta sin nombre',
    }));
  }

  async clientas(): Promise<ClientaResumen[]> {
    const { data, error } = await this.db.from('perfiles').select('id, nombre').eq('rol', 'clienta').order('nombre');
    falla(error);
    return (data ?? []) as ClientaResumen[];
  }

  async ficha(clientaId: string): Promise<DatosFicha> {
    const { data, error } = await this.db.from('fichas_esteticas').select('*').eq('clienta_id', clientaId).maybeSingle();
    falla(error);
    const f = data as FilaFicha | null;
    if (!f) return { alergias: [], consentimiento: null, notas: '' };
    return {
      alergias: f.alergias ?? [],
      notas: f.notas ?? '',
      consentimiento: f.consentimiento_firmado_en
        ? {
            tratamiento: f.consentimiento_tratamiento,
            alergias: f.consentimiento_alergias,
            fotosClinicas: f.consentimiento_fotos,
            firmadoEn: new Date(f.consentimiento_firmado_en),
          }
        : null,
    };
  }

  async guardarFicha(clientaId: string, datos: DatosFicha): Promise<void> {
    const { error } = await this.db.from('fichas_esteticas').upsert({
      clienta_id: clientaId,
      alergias: datos.alergias,
      notas: datos.notas,
      consentimiento_tratamiento: datos.consentimiento?.tratamiento ?? false,
      consentimiento_alergias: datos.consentimiento?.alergias ?? false,
      consentimiento_fotos: datos.consentimiento?.fotosClinicas ?? false,
      consentimiento_firmado_en: datos.consentimiento?.firmadoEn.toISOString() ?? null,
      actualizada_en: new Date().toISOString(),
    });
    falla(error);
  }

  async fotos(clientaId: string): Promise<FotoClinica[]> {
    const { data, error } = await this.db
      .from('fotos_sesion')
      .select('id, ruta, fecha')
      .eq('clienta_id', clientaId)
      .order('fecha', { ascending: false });
    falla(error);
    const filas = (data ?? []) as { id: string; ruta: string; fecha: string }[];
    if (filas.length === 0) return [];

    // Enlaces temporales (1 hora): las fotos nunca son públicas.
    const { data: firmadas, error: errorFirma } = await this.db.storage
      .from(BUCKET_FOTOS)
      .createSignedUrls(filas.map((f) => f.ruta), 3600);
    falla(errorFirma);
    const urls = new Map(
      ((firmadas ?? []) as { path: string | null; signedUrl: string }[]).map((s) => [s.path, s.signedUrl]),
    );
    return filas
      .filter((f) => urls.get(f.ruta))
      .map((f) => ({ id: f.id, fecha: new Date(f.fecha), url: urls.get(f.ruta) as string }));
  }

  async subirFoto(clientaId: string, uriLocal: string): Promise<void> {
    const archivo = await (await fetch(uriLocal)).arrayBuffer();
    const ruta = `${clientaId}/${Date.now()}.jpg`;
    const { error } = await this.db.storage.from(BUCKET_FOTOS).upload(ruta, archivo, { contentType: 'image/jpeg' });
    falla(error);
    const { error: errorRegistro } = await this.db.from('fotos_sesion').insert({ clienta_id: clientaId, ruta });
    falla(errorRegistro);
  }

  async tendencias(): Promise<Tendencia[]> {
    const { data, error } = await this.db.from('tendencias').select('*').order('nombre');
    falla(error);
    return ((data ?? []) as FilaTendencia[]).map(aTendencia);
  }

  async marcarTendencia(id: string, validada: boolean): Promise<void> {
    const { error } = await this.db
      .from('tendencias')
      .update({ validada, actualizada_en: new Date().toISOString() })
      .eq('id', id);
    falla(error);
  }
}
