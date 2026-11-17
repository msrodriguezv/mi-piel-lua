import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colores, espacio, fuentes } from '../theme';

export function Encabezado({ antetitulo, titulo, subtitulo }: { antetitulo?: string; titulo: string; subtitulo?: string }) {
  return (
    <View style={styles.contenedor}>
      {antetitulo ? <Text style={styles.ante}>{antetitulo}</Text> : null}
      <Text style={styles.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={styles.sub}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: espacio.xs, marginBottom: espacio.l },
  ante: { color: colores.oroOscuro, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  titulo: { color: colores.texto, fontSize: 28, fontFamily: fuentes.titulo },
  sub: { color: colores.texto2, fontSize: 14, lineHeight: 20 },
});
