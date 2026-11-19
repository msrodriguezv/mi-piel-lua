import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colores, espacio, radio } from '../theme';

interface Props extends TextInputProps {
  etiqueta: string;
}

export function CampoTexto({ etiqueta, style, ...resto }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput placeholderTextColor={colores.texto3} style={[styles.input, style]} {...resto} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: espacio.xs },
  etiqueta: { color: colores.texto, fontWeight: '600', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colores.arena,
    backgroundColor: colores.blanco,
    borderRadius: radio.s,
    padding: espacio.m,
    fontSize: 15,
    color: colores.texto,
  },
});
