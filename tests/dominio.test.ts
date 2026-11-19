import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Fototipo } from '../src/domain/piel/Fototipo';
import { PerfilPiel } from '../src/domain/piel/PerfilPiel';
import { evaluarConfiabilidad } from '../src/domain/tendencias/ConfiabilidadBenford';
import { Tendencia } from '../src/domain/tendencias/Tendencia';
import { TENDENCIAS_SEMILLA } from '../src/infrastructure/memoria/tendenciasSemilla';
import { Anticipo } from '../src/domain/citas/Anticipo';
import { Cita } from '../src/domain/citas/Cita';
import { CodigoPromocion } from '../src/domain/citas/CodigoPromocion';
import { buscarServicio } from '../src/domain/citas/Servicio';
import { calcularVentanaRetoque } from '../src/domain/citas/CalculadorRetoque';
import { FichaEstetica } from '../src/domain/ficha/FichaEstetica';

test('Fototipo solo acepta enteros del 1 al 6 y agrupa bien', () => {
  assert.throws(() => Fototipo.crear(7));
  assert.throws(() => Fototipo.crear(2.5));
  assert.equal(Fototipo.crear(4).grupo, 'III-IV');
  assert.equal(Fototipo.crear(6).romano, 'VI');
});

test('La tendencia se evalúa según biotipo y fototipo', () => {
  const retinol = Tendencia.crear(TENDENCIAS_SEMILLA.find((t) => t.id === 'retinol-noche')!);
  const sensibleOscura = new PerfilPiel('sensible', Fototipo.crear(5));
  const r = retinol.evaluarPara(sensibleOscura);
  assert.equal(r.estado, 'evitalo');
  assert.ok(r.precaucionFototipo);
});

test('Una tendencia sin validar no se publica', () => {
  const pendiente = Tendencia.crear(TENDENCIAS_SEMILLA.find((t) => !t.validadaPorEspecialista)!);
  assert.equal(pendiente.publicable, false);
});

test('Benford: muestra pequeña es insuficiente; distribución de Benford es alta', () => {
  assert.equal(evaluarConfiabilidad([1, 2, 3]).nivel, 'insuficiente');
  const benford: number[] = [];
  for (let d = 1; d <= 9; d++) {
    const n = Math.round(Math.log10(1 + 1 / d) * 1000);
    for (let i = 0; i < n; i++) benford.push(d * 1000 + i);
  }
  assert.equal(evaluarConfiabilidad(benford).nivel, 'alta');
  assert.equal(evaluarConfiabilidad(Array(200).fill(9000)).nivel, 'baja');
});

test('La cita se confirma con anticipo y la primera exige consentimiento', () => {
  const cita = new Cita('c1', buscarServicio('lifting'), new Date('2026-12-01T10:00:00'), true);
  assert.throws(() => cita.marcarRealizada(true));
  cita.pagarAnticipo(Anticipo.registrar(10, 'deuna'));
  assert.equal(cita.estado, 'confirmada');
  assert.throws(() => cita.marcarRealizada(false));
  cita.marcarRealizada(true);
  const ventana = calcularVentanaRetoque(cita)!;
  const dias = (ventana.desde.getTime() - cita.fechaHora.getTime()) / 86400000;
  assert.equal(dias, 42);
});

test('Código de promoción normaliza y aplica descuento', () => {
  const c = CodigoPromocion.crear(' lifting10 ', 10, new Date('2027-01-01'), 'Reel');
  assert.equal(c.codigo, 'LIFTING10');
  assert.equal(c.aplicarA(25), 22.5);
  assert.throws(() => CodigoPromocion.crear('con espacio', 10, new Date(), 'x'));
});

test('Solo la especialista ve las fotos clínicas', () => {
  const ficha = new FichaEstetica('cl1', { tratamiento: true, alergias: true, fotosClinicas: true, firmadoEn: new Date() });
  ficha.agregarFoto({ id: 'f1', fecha: new Date(), uri: 'privado://f1' });
  assert.throws(() => ficha.verFotos('clienta'));
  assert.equal(ficha.verFotos('especialista').length, 1);
});

import { AgendarCita } from '../src/application/AgendarCita';
import { RegistrarPagoAnticipo } from '../src/application/RegistrarPagoAnticipo';
import {
  CitaRepositoryMemoria, CodigoPromocionRepositoryMemoria, ServicioRepositoryMemoria,
} from '../src/infrastructure/memoria/CitaRepositoryMemoria';
import { generarId } from '../src/domain/compartido/generarId';

function casoDeUso() {
  const citas = new CitaRepositoryMemoria();
  const codigos = new CodigoPromocionRepositoryMemoria([
    CodigoPromocion.crear('LIFTING10', 10, new Date('2027-12-31'), 'Reel'),
  ]);
  return { citas, agendar: new AgendarCita(citas, codigos, new ServicioRepositoryMemoria()) };
}

test('Agendar: crea la cita pendiente y el anticipo la confirma', async () => {
  const { citas, agendar } = casoDeUso();
  const hoy = new Date('2026-12-01T08:00:00');
  const cita = await agendar.ejecutar({ servicioId: 'lifting', fechaHora: new Date('2026-12-02T10:00:00'), esPrimeraCita: true, codigoPromocion: 'lifting10' }, hoy);
  assert.equal(cita.estado, 'pendiente_anticipo');
  assert.equal(cita.codigo?.codigo, 'LIFTING10');
  await new RegistrarPagoAnticipo(citas).ejecutar(cita.id, 10, 'deuna');
  assert.equal((await citas.buscar(cita.id))?.estado, 'confirmada');
});

test('Agendar: no permite dos citas en el mismo horario ni servicios inexistentes', async () => {
  const { agendar } = casoDeUso();
  const hoy = new Date('2026-12-01T08:00:00');
  const fecha = new Date('2026-12-02T10:00:00');
  await agendar.ejecutar({ servicioId: 'lifting', fechaHora: fecha, esPrimeraCita: false }, hoy);
  await assert.rejects(agendar.ejecutar({ servicioId: 'laminado-cejas', fechaHora: fecha, esPrimeraCita: false }, hoy), /horario/);
  await assert.rejects(agendar.ejecutar({ servicioId: 'no-existe', fechaHora: new Date('2026-12-03T10:00:00'), esPrimeraCita: false }, hoy), /servicio/);
  await assert.rejects(agendar.ejecutar({ servicioId: 'lifting', fechaHora: new Date('2026-12-04T10:00:00'), esPrimeraCita: false, codigoPromocion: 'FALSO99' }, hoy), /código/);
});

test('Los identificadores generados son UUID v4 válidos para la base de datos', () => {
  const id = generarId();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(id, generarId());
});
