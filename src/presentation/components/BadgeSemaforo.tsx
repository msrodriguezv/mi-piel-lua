import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ETIQUETA_SEMAFORO, EstadoSemaforo } from '../../domain/tendencias/Semaforo';
import { radio, semaforo } from '../theme';

export function BadgeSemaforo({ estado }: { estado: EstadoSemaforo }) {
  const c = semaforo[estado];
  return (
    <View style={[styles.badge, { backgroundColor: c.fondo }]}>
      <View style={[styles.punto, { backgroundColor: c.texto }]} />
      <Text style={[styles.texto, { color: c.texto }]}>{ETIQUETA_SEMAFORO[estado]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radio.pill, gap: 6 },
  punto: { width: 7, height: 7, borderRadius: 4 },
  texto: { fontSize: 12, fontWeight: '700' },
});
