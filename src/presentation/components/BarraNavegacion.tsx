import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, espacio } from '../theme';

export type Pestana = 'piel' | 'tendencias' | 'agendar' | 'citas';

const PESTANAS: { id: Pestana; etiqueta: string; icono: string }[] = [
  { id: 'piel', etiqueta: 'Mi piel', icono: '◐' },
  { id: 'tendencias', etiqueta: 'Tendencias', icono: '✦' },
  { id: 'agendar', etiqueta: 'Agendar', icono: '＋' },
  { id: 'citas', etiqueta: 'Mis citas', icono: '◷' },
];

export function BarraNavegacion({ activa, onCambiar }: { activa: Pestana; onCambiar: (p: Pestana) => void }) {
  return (
    <View style={styles.barra}>
      {PESTANAS.map((p) => {
        const activo = p.id === activa;
        return (
          <Pressable
            key={p.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
            onPress={() => onCambiar(p.id)}
            style={styles.item}
          >
            <Text style={[styles.icono, activo && styles.activo]}>{p.icono}</Text>
            <Text style={[styles.etiqueta, activo && styles.activo]}>{p.etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: { flexDirection: 'row', backgroundColor: colores.blanco, borderTopWidth: 1, borderTopColor: colores.arena, paddingTop: espacio.s },
  item: { flex: 1, alignItems: 'center', paddingVertical: espacio.xs, gap: 2 },
  icono: { fontSize: 18, color: colores.texto3 },
  etiqueta: { fontSize: 11, color: colores.texto3 },
  activo: { color: colores.cafe, fontWeight: '700' },
});
