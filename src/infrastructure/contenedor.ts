import { AgendarCita } from '../application/AgendarCita';
import { AutenticacionGateway } from '../application/Autenticacion';
import { CalcularProximoRetoque } from '../application/CalcularProximoRetoque';
import { ObtenerTendenciasParaMiPiel } from '../application/ObtenerTendenciasParaMiPiel';
import {
  CancelarCita, MarcarCitaRealizada, PanelEspecialistaRepository, SubirFotoClinica,
} from '../application/PanelEspecialista';
import { RegistrarPagoAnticipo } from '../application/RegistrarPagoAnticipo';
import { Anticipo } from '../domain/citas/Anticipo';
import { Cita } from '../domain/citas/Cita';
import { CitaRepository, CodigoPromocionRepository, ServicioRepository } from '../domain/citas/CitaRepository';
import { CodigoPromocion } from '../domain/citas/CodigoPromocion';
import { buscarServicio } from '../domain/citas/Servicio';
import { ClubRepository } from '../domain/fidelizacion/ClubLua';
import { TendenciaRepository } from '../domain/tendencias/TendenciaRepository';
import { AutenticacionDemo } from './memoria/AutenticacionDemo';
import {
  CitaRepositoryMemoria, ClubRepositoryMemoria, CodigoPromocionRepositoryMemoria, ServicioRepositoryMemoria,
} from './memoria/CitaRepositoryMemoria';
import { TendenciaRepositoryMemoria } from './memoria/TendenciaRepositoryMemoria';
import { TENDENCIAS_SEMILLA } from './memoria/tendenciasSemilla';
import { AutenticacionSupabase } from './supabase/AutenticacionSupabase';
import { crearClienteSupabase } from './supabase/cliente';
import { PanelEspecialistaSupabase } from './supabase/PanelEspecialistaSupabase';
import {
  CitaRepositorySupabase, ClubRepositorySupabase, CodigoPromocionRepositorySupabase,
  ServicioRepositorySupabase, TendenciaRepositorySupabase,
} from './supabase/repositorios';

interface Adaptadores {
  modo: 'supabase' | 'demo';
  auth: AutenticacionGateway;
  tendencias: TendenciaRepository;
  citas: CitaRepository;
  codigos: CodigoPromocionRepository;
  servicios: ServicioRepository;
  club: ClubRepository;
  panel: PanelEspecialistaRepository | null;
}

function adaptadoresSupabase(url: string, clave: string): Adaptadores {
  const db = crearClienteSupabase(url, clave);
  return {
    modo: 'supabase',
    auth: new AutenticacionSupabase(db),
    tendencias: new TendenciaRepositorySupabase(db),
    citas: new CitaRepositorySupabase(db),
    codigos: new CodigoPromocionRepositorySupabase(db),
    servicios: new ServicioRepositorySupabase(db),
    club: new ClubRepositorySupabase(db),
    panel: new PanelEspecialistaSupabase(db),
  };
}

function adaptadoresDemo(): Adaptadores {
  const citas = new CitaRepositoryMemoria();
  // Cita de demostración ya realizada, para ver el recordatorio de retoque.
  const demo = new Cita('demo-1', buscarServicio('lifting'), new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), true);
  demo.pagarAnticipo(Anticipo.registrar(10, 'deuna'));
  demo.marcarRealizada(true);
  void citas.guardar(demo);

  return {
    modo: 'demo',
    auth: new AutenticacionDemo(),
    tendencias: new TendenciaRepositoryMemoria(TENDENCIAS_SEMILLA),
    citas,
    codigos: new CodigoPromocionRepositoryMemoria([
      CodigoPromocion.crear('LIFTING10', 10, new Date('2027-12-31'), 'Reel lifting de pestañas'),
      CodigoPromocion.crear('LUAPIEL15', 15, new Date('2027-12-31'), 'Post radar de tendencias'),
    ]),
    servicios: new ServicioRepositoryMemoria(),
    club: new ClubRepositoryMemoria(citas),
    panel: null,
  };
}

/**
 * Raíz de composición: único lugar donde se conectan dominio e infraestructura.
 * Con las variables EXPO_PUBLIC_SUPABASE_* usa Supabase; sin ellas, el modo demostración en memoria.
 */
function crearContenedor() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const clave = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  const a = url && clave ? adaptadoresSupabase(url, clave) : adaptadoresDemo();

  return {
    modo: a.modo,
    auth: a.auth,
    citas: a.citas,
    servicios: a.servicios,
    club: a.club,
    panel: a.panel,
    obtenerTendencias: new ObtenerTendenciasParaMiPiel(a.tendencias),
    agendarCita: new AgendarCita(a.citas, a.codigos, a.servicios),
    registrarAnticipo: new RegistrarPagoAnticipo(a.citas),
    calcularRetoque: new CalcularProximoRetoque(a.citas),
    marcarRealizada: a.panel ? new MarcarCitaRealizada(a.citas, a.panel) : null,
    cancelarCita: new CancelarCita(a.citas),
    subirFoto: a.panel ? new SubirFotoClinica(a.panel) : null,
  };
}

export const contenedor = crearContenedor();
