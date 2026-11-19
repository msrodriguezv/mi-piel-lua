import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colores, espacio, radio } from '../theme';

interface Props {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
  deshabilitado?: boolean;
}

export function Chip({ etiqueta, activo, onPress, deshabilitado = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo, disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={[styles.chip, activo && styles.activo, deshabilitado && styles.deshabilitado]}
    >
      <Text style={[styles.texto, activo && styles.textoActivo, deshabilitado && styles.textoDeshabilitado]}>
        {etiqueta}
      </Text>
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
  deshabilitado: { backgroundColor: colores.crema, borderColor: colores.crema },
  texto: { color: colores.texto2, fontSize: 14 },
  textoActivo: { color: colores.blanco, fontWeight: '600' },
  textoDeshabilitado: { color: colores.texto3, textDecorationLine: 'line-through' },
});
