import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, espacio } from '../theme';

export interface ItemNavegacion<T extends string> {
  id: T;
  etiqueta: string;
  icono: string;
}

interface Props<T extends string> {
  items: ItemNavegacion<T>[];
  activa: T;
  onCambiar: (id: T) => void;
}

export function BarraNavegacion<T extends string>({ items, activa, onCambiar }: Props<T>) {
  return (
    <View style={styles.barra}>
      {items.map((p) => {
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
