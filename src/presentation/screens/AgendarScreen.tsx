import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MetodoPago } from '../../domain/citas/Anticipo';
import { Servicio } from '../../domain/citas/Servicio';
import { contenedor } from '../../infrastructure/contenedor';
import { Boton } from '../components/Boton';
import { Chip } from '../components/Chip';
import { Encabezado } from '../components/Encabezado';
import { Tarjeta } from '../components/Tarjeta';
import { colores, espacio, radio } from '../theme';
import { avisar, mensajeDe } from '../utils/avisar';

const HORAS = ['09:00', '11:00', '14:00', '16:00', '18:00'];
const ANTICIPO_USD = 10;

function proximosDias(n: number): Date[] {
  const hoy = new Date();
  return Array.from({ length: n }, (_, i) => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i + 1));
}

function fechaHora(dia: Date, hora: string): Date {
  const [h, m] = hora.split(':').map(Number);
  const fecha = new Date(dia);
  fecha.setHours(h, m, 0, 0);
  return fecha;
}

export function AgendarScreen({ onAgendada }: { onAgendada: () => void }) {
  const dias = useMemo(() => proximosDias(7), []);
  const [servicios, setServicios] = useState<Servicio[] | null>(null);
  const [ocupados, setOcupados] = useState<Set<number>>(new Set());
  const [servicioId, setServicioId] = useState('');
  const [dia, setDia] = useState(0);
  const [hora, setHora] = useState(HORAS[0]);
  const [codigo, setCodigo] = useState('');
  const [metodo, setMetodo] = useState<MetodoPago>('deuna');
  const [primeraVez, setPrimeraVez] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const cargarOcupados = useCallback(async () => {
    try {
      const fin = new Date(dias[dias.length - 1]);
      fin.setHours(23, 59, 59, 999);
      const fechas = await contenedor.citas.horariosOcupados(dias[0], fin);
      setOcupados(new Set(fechas.map((f) => f.getTime())));
    } catch {
      setOcupados(new Set());
    }
  }, [dias]);

  useEffect(() => {
    contenedor.servicios
      .listar()
      .then((lista) => {
        setServicios(lista);
        if (lista.length > 0) setServicioId(lista[0].id);
      })
      .catch((e) => {
        setServicios([]);
        avisar('No se pudieron cargar los servicios', mensajeDe(e));
      });
    void cargarOcupados();
  }, [cargarOcupados]);

  const estaOcupado = (d: Date, h: string) => ocupados.has(fechaHora(d, h).getTime());

  async function confirmar() {
    if (!servicioId) return;
    if (estaOcupado(dias[dia], hora)) {
      avisar('Horario no disponible', 'Elige otra hora.');
      return;
    }
    setEnviando(true);
    try {
      const fecha = fechaHora(dias[dia], hora);
      const cita = await contenedor.agendarCita.ejecutar({ servicioId, fechaHora: fecha, esPrimeraCita: primeraVez, codigoPromocion: codigo });
      await contenedor.registrarAnticipo.ejecutar(cita.id, ANTICIPO_USD, metodo);
      avisar('¡Cita confirmada!', primeraVez ? 'Antes de tu cita firmarás el consentimiento informado.' : 'Te esperamos en LÚA.');
      setCodigo('');
      onAgendada();
    } catch (e) {
      avisar('No se pudo agendar', mensajeDe(e));
      void cargarOcupados();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
      <Encabezado antetitulo="AGENDA" titulo="Reserva tu cita" subtitulo="Aseguras tu espacio con un anticipo que se descuenta del total." />

      <Text style={styles.seccion}>Servicio</Text>
      {!servicios ? <ActivityIndicator color={colores.oro} /> : null}
      <View style={styles.fila}>
        {servicios?.map((s) => (
          <Chip key={s.id} etiqueta={s.nombre} activo={s.id === servicioId} onPress={() => setServicioId(s.id)} />
        ))}
      </View>

      <Text style={styles.seccion}>Día</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fila}>
        {dias.map((d, i) => (
          <Chip key={d.toISOString()} etiqueta={d.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric' })} activo={i === dia} onPress={() => setDia(i)} />
        ))}
      </ScrollView>

      <Text style={styles.seccion}>Hora</Text>
      <View style={styles.fila}>
        {HORAS.map((h) => (
          <Chip key={h} etiqueta={h} activo={h === hora} deshabilitado={estaOcupado(dias[dia], h)} onPress={() => setHora(h)} />
        ))}
      </View>

      <Text style={styles.seccion}>¿Es tu primera vez en LÚA?</Text>
      <View style={styles.fila}>
        <Chip etiqueta="Sí" activo={primeraVez} onPress={() => setPrimeraVez(true)} />
        <Chip etiqueta="No" activo={!primeraVez} onPress={() => setPrimeraVez(false)} />
      </View>

      <Text style={styles.seccion}>Código de promoción (opcional)</Text>
      <TextInput
        value={codigo}
        onChangeText={setCodigo}
        placeholder="Ej. LIFTING10"
        placeholderTextColor={colores.texto3}
        autoCapitalize="characters"
        style={styles.input}
      />

      <Tarjeta estilo={styles.pago}>
        <Text style={styles.seccion}>Anticipo: ${ANTICIPO_USD.toFixed(2)}</Text>
        <View style={styles.fila}>
          <Chip etiqueta="Deuna" activo={metodo === 'deuna'} onPress={() => setMetodo('deuna')} />
          <Chip etiqueta="Transferencia" activo={metodo === 'transferencia'} onPress={() => setMetodo('transferencia')} />
        </View>
        <Text style={styles.ayuda}>Demo académica: el pago se simula, no se cobra nada.</Text>
      </Tarjeta>

      <Boton
        titulo={enviando ? 'Confirmando…' : 'Pagar anticipo y confirmar'}
        onPress={confirmar}
        deshabilitado={enviando || !servicioId}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: espacio.xl, gap: espacio.m, paddingBottom: espacio.xxl },
  seccion: { color: colores.texto, fontWeight: '700', fontSize: 15, marginTop: espacio.s },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
  input: { borderWidth: 1, borderColor: colores.arena, backgroundColor: colores.blanco, borderRadius: radio.s, padding: espacio.m, fontSize: 15, color: colores.texto },
  pago: { backgroundColor: colores.crema },
  ayuda: { color: colores.texto3, fontSize: 12 },
});
