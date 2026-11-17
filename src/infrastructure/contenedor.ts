import { AgendarCita } from '../application/AgendarCita';
import { CalcularProximoRetoque } from '../application/CalcularProximoRetoque';
import { ObtenerTendenciasParaMiPiel } from '../application/ObtenerTendenciasParaMiPiel';
import { RegistrarPagoAnticipo } from '../application/RegistrarPagoAnticipo';
import { Anticipo } from '../domain/citas/Anticipo';
import { Cita } from '../domain/citas/Cita';
import { CodigoPromocion } from '../domain/citas/CodigoPromocion';
import { buscarServicio } from '../domain/citas/Servicio';
import { CitaRepositoryMemoria, CodigoPromocionRepositoryMemoria } from './memoria/CitaRepositoryMemoria';
import { TendenciaRepositoryMemoria } from './memoria/TendenciaRepositoryMemoria';
import { TENDENCIAS_SEMILLA } from './memoria/tendenciasSemilla';

/** Raíz de composición: único lugar donde se conectan dominio e infraestructura. */
const tendencias = new TendenciaRepositoryMemoria(TENDENCIAS_SEMILLA);
const citas = new CitaRepositoryMemoria();
const codigos = new CodigoPromocionRepositoryMemoria([
  CodigoPromocion.crear('LIFTING10', 10, new Date('2027-12-31'), 'Reel lifting de pestañas'),
  CodigoPromocion.crear('LUAPIEL15', 15, new Date('2027-12-31'), 'Post radar de tendencias'),
]);

// Cita de demostración ya realizada, para ver el recordatorio de retoque.
const demo = new Cita('demo-1', buscarServicio('lifting'), new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), true);
demo.pagarAnticipo(Anticipo.registrar(10, 'deuna'));
demo.marcarRealizada(true);
void citas.guardar(demo);

export const contenedor = {
  obtenerTendencias: new ObtenerTendenciasParaMiPiel(tendencias),
  agendarCita: new AgendarCita(citas, codigos),
  registrarAnticipo: new RegistrarPagoAnticipo(citas),
  calcularRetoque: new CalcularProximoRetoque(citas),
  citas,
};
