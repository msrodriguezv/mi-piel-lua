import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CitaEnAgenda } from '../../../application/PanelEspecialista';
import { EstadoCita } from '../../../domain/citas/Cita';
import { contenedor } from '../../../infrastructure/contenedor';
import { Boton } from '../../components/Boton';
import { Encabezado } from '../../components/Encabezado';
import { Tarjeta } from '../../components/Tarjeta';
import { colores, espacio, radio } from '../../theme';
import { avisar, mensajeDe } from '../../utils/avisar';

const ESTADO: Record<EstadoCita, { texto: string; color: string; fondo: string }> = {
  pendiente_anticipo: { texto: 'Sin anticipo', color: '#8A5A12', fondo: '#F6EAD4' },
  confirmada: { texto: 'Confirmada', color: '#3F6B47', fondo: '#E3EEE2' },
  realizada: { texto: 'Realizada', color: colores.texto3, fondo: colores.crema },
  cancelada: { texto: 'Cancelada', color: '#9A3A30', fondo: '#F6DFDB' },
};

const dia = (d: Date) => d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
const hora = (d: Date) => d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

/** Agenda de la especialista: citas desde hoy, agrupadas por día. */
export function PanelAgendaScreen() {
  const [items, setItems] = useState<CitaEnAgenda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ocupada, setOcupada] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!contenedor.panel) return;
    setCargando(true);
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      setItems(await contenedor.panel.agenda(hoy));
    } catch (e) {
      avisar('No se pudo cargar la agenda', mensajeDe(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  async function accion(item: CitaEnAgenda, tipo: 'realizada' | 'cancelar') {
    setOcupada(item.cita.id);
    try {
      if (tipo === 'realizada') await contenedor.marcarRealizada?.ejecutar(item.cita.id, item.clientaId);
      else await contenedor.cancelarCita.ejecutar(item.cita.id);
      await cargar();
    } catch (e) {
      avisar('No se pudo actualizar la cita', mensajeDe(e));
    } finally {
      setOcupada(null);
    }
  }

  const grupos = new Map<string, CitaEnAgenda[]>();
  for (const item of items) {
    const clave = dia(item.cita.fechaHora);
    grupos.set(clave, [...(grupos.get(clave) ?? []), item]);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contenido}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} tintColor={colores.oro} />}
    >
      <Encabezado antetitulo="PANEL DE LA ESPECIALISTA" titulo="Agenda" subtitulo="Citas desde hoy. Desliza hacia abajo para actualizar." />
      {!cargando && items.length === 0 ? <Text style={styles.vacio}>No hay citas próximas.</Text> : null}

      {[...grupos.entries()].map(([titulo, citasDelDia]) => (
        <View key={titulo} style={styles.grupo}>
          <Text style={styles.dia}>{titulo}</Text>
          {citasDelDia.map((item) => {
            const { cita } = item;
            const e = ESTADO[cita.estado];
            return (
              <Tarjeta key={cita.id}>
                <View style={styles.fila}>
                  <Text style={styles.hora}>{hora(cita.fechaHora)}</Text>
                  <Text style={[styles.estado, { color: e.color, backgroundColor: e.fondo }]}>{e.texto}</Text>
                </View>
                <Text style={styles.clienta}>{item.clientaNombre}</Text>
                <Text style={styles.detalle}>
                  {cita.servicio.nombre}
                  {cita.esPrimeraCita ? ' · Primera cita (requiere consentimiento)' : ''}
                </Text>
                {cita.anticipo ? (
                  <Text style={styles.detalle}>Anticipo ${cita.anticipo.monto.toFixed(2)} vía {cita.anticipo.metodo}</Text>
                ) : null}
                {cita.codigo ? <Text style={styles.detalle}>Código {cita.codigo.codigo} (−{cita.codigo.porcentaje}%)</Text> : null}

                {cita.estado === 'confirmada' || cita.estado === 'pendiente_anticipo' ? (
                  <View style={styles.acciones}>
                    {cita.estado === 'confirmada' ? (
                      <View style={styles.flex}>
                        <Boton titulo="Marcar realizada" onPress={() => accion(item, 'realizada')} deshabilitado={ocupada === cita.id} />
                      </View>
                    ) : null}
                    <View style={styles.flex}>
                      <Boton titulo="Cancelar" variante="secundario" onPress={() => accion(item, 'cancelar')} deshabilitado={ocupada === cita.id} />
                    </View>
                  </View>
                ) : null}
              </Tarjeta>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: espacio.xl, gap: espacio.m, paddingBottom: espacio.xxl },
  vacio: { color: colores.texto2, fontSize: 14 },
  grupo: { gap: espacio.s },
  dia: { color: colores.oroOscuro, fontWeight: '700', fontSize: 13, textTransform: 'capitalize', marginTop: espacio.s },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hora: { fontSize: 18, fontWeight: '700', color: colores.texto },
  estado: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radio.pill, overflow: 'hidden' },
  clienta: { fontSize: 16, fontWeight: '600', color: colores.texto },
  detalle: { color: colores.texto2, fontSize: 13 },
  acciones: { flexDirection: 'row', gap: espacio.s, marginTop: espacio.s },
  flex: { flex: 1 },
});
