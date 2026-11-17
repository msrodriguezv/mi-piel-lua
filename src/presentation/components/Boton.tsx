import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colores, espacio, radio } from '../theme';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  deshabilitado?: boolean;
}

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado = false }: Props) {
  const primario = variante === 'primario';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primario ? styles.primario : styles.secundario,
        (pressed || deshabilitado) && { opacity: deshabilitado ? 0.45 : 0.85 },
      ]}
    >
      <Text style={[styles.texto, { color: primario ? colores.blanco : colores.cafe }]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: espacio.m + 2, borderRadius: radio.pill, alignItems: 'center' },
  primario: { backgroundColor: colores.cafe },
  secundario: { borderWidth: 1, borderColor: colores.oro, backgroundColor: 'transparent' },
  texto: { fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
});
