import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colores, espacio, radio } from '../theme';

export function Tarjeta({ children, estilo }: { children: ReactNode; estilo?: ViewStyle }) {
  return <View style={[styles.tarjeta, estilo]}>{children}</View>;
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radio.m,
    padding: espacio.l,
    borderWidth: 1,
    borderColor: colores.arena,
    gap: espacio.s,
  },
});
