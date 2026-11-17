/**
 * Adaptador del radar de tendencias (Apify · clockworks/tiktok-scraper).
 *
 * ⚠️ SOLO BACKEND / SCRIPTS. El token de Apify nunca va dentro de la app móvil.
 * Se consultan HASHTAGS y se guardan únicamente métricas agregadas
 * (vistas, likes, compartidos). No se almacenan perfiles, nombres ni
 * comentarios de personas concretas.
 */
export interface MetricaHashtag {
  hashtag: string;
  publicaciones: number;
  vistas: number[]; // se usan para el análisis de Benford y el ranking
}

interface ItemApify {
  playCount?: number;
}

export class ApifyTendenciaGateway {
  private static readonly ENDPOINT =
    'https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items';

  constructor(private readonly token: string) {
    if (!token) throw new Error('Falta APIFY_TOKEN (variable de entorno del backend).');
  }

  async consultarHashtag(hashtag: string, maxResultados = 100): Promise<MetricaHashtag> {
    const respuesta = await fetch(`${ApifyTendenciaGateway.ENDPOINT}?token=${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashtags: [hashtag.replace('#', '')], resultsPerPage: maxResultados }),
    });
    if (!respuesta.ok) throw new Error(`Apify respondió ${respuesta.status}`);
    const items = (await respuesta.json()) as ItemApify[];
    // Solo se conserva el número de vistas de cada publicación: nada que identifique a nadie.
    const vistas = items.map((i) => i.playCount ?? 0).filter((v) => v > 0);
    return { hashtag, publicaciones: items.length, vistas };
  }
}
