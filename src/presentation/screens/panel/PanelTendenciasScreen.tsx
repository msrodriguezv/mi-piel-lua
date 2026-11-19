import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Tendencia } from '../../../domain/tendencias/Tendencia';
import { contenedor } from '../../../infrastructure/contenedor';
import { Chip } from '../../components/Chip';
import { Encabezado } from '../../components/Encabezado';
import { Tarjeta } from '../../components/Tarjeta';
import { colores, espacio, fuentes } from '../../theme';
import { avisar, mensajeDe } from '../../utils/avisar';

const CONFIABILIDAD: Record<string, string> = {
  alta: 'Confiabilidad alta',
  media: 'Confiabilidad media',
  baja: 'Confiabilidad baja · posibles vistas infladas',
  insuficiente: 'Datos insuficientes',
};

/** La especialista decide qué tendencias ven las clientas. */
export function PanelTendenciasScreen() {
  const [tendencias, setTendencias] = useState<Tendencia[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    if (!contenedor.panel) return;
    setCargando(true);
    try {
      setTendencias(await contenedor.panel.tendencias());
    } catch (e) {
      avisar('No se pudieron cargar las tendencias', mensajeDe(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  async function cambiar(t: Tendencia, validada: boolean) {
    try {
      await contenedor.panel?.marcarTendencia(t.id, validada);
      await cargar();
    } catch (e) {
      avisar('No se pudo actualizar', mensajeDe(e));
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contenido}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} tintColor={colores.oro} />}
    >
      <Encabezado
        antetitulo="PANEL DE LA ESPECIALISTA"
        titulo="Radar de tendencias"
        subtitulo="Publica solo lo que revisaste. Las de confiabilidad baja nunca se muestran a las clientas."
      />
      {tendencias.map((t) => (
        <Tarjeta key={t.id}>
          <Text style={styles.nombre}>{t.nombre}</Text>
          <Text style={styles.hashtag}>{t.hashtag}</Text>
          <Text style={[styles.confiabilidad, t.confiabilidad === 'baja' && styles.alerta]}>{CONFIABILIDAD[t.confiabilidad]}</Text>
          <View style={styles.fila}>
            <Chip etiqueta="Publicada" activo={t.validada} onPress={() => cambiar(t, true)} />
            <Chip etiqueta="Oculta" activo={!t.validada} onPress={() => cambiar(t, false)} />
          </View>
        </Tarjeta>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: espacio.xl, gap: espacio.m, paddingBottom: espacio.xxl },
  nombre: { fontFamily: fuentes.titulo, fontSize: 19, color: colores.texto },
  hashtag: { color: colores.oroOscuro, fontSize: 12 },
  confiabilidad: { color: colores.texto2, fontSize: 13 },
  alerta: { color: '#9A3A30', fontWeight: '600' },
  fila: { flexDirection: 'row', gap: espacio.s, marginTop: espacio.xs },
});
