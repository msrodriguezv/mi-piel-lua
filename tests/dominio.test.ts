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
