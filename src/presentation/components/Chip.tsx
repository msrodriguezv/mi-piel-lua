import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colores, espacio, radio } from '../theme';

interface Props {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
}

export function Chip({ etiqueta, activo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[styles.chip, activo && styles.activo]}
    >
      <Text style={[styles.texto, activo && styles.textoActivo]}>{etiqueta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: espacio.l,
    paddingVertical: espacio.s + 2,
    borderRadius: radio.pill,
    borderWidth: 1,
    borderColor: colores.arena,
    backgroundColor: colores.blanco,
  },
  activo: { backgroundColor: colores.cafe, borderColor: colores.cafe },
  texto: { color: colores.texto2, fontSize: 14 },
  textoActivo: { color: colores.blanco, fontWeight: '600' },
});
