import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BIOTIPOS } from '../../domain/piel/Biotipo';
import { Fototipo } from '../../domain/piel/Fototipo';
import { PerfilPiel } from '../../domain/piel/PerfilPiel';
import { Boton } from '../components/Boton';
import { Chip } from '../components/Chip';
import { Encabezado } from '../components/Encabezado';
import { Tarjeta } from '../components/Tarjeta';
import { colores, espacio, fuentes, radio } from '../theme';

interface Props {
  perfil: PerfilPiel;
  onCambiar: (perfil: PerfilPiel) => void;
  nombre?: string;
  onCerrarSesion?: () => void;
}

export function MiPielScreen({ perfil, onCambiar, nombre, onCerrarSesion }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Encabezado
        antetitulo={nombre ? `HOLA, ${nombre.toUpperCase()}` : 'MI PIEL LÚA'}
        titulo="¿Cómo es tu piel?"
        subtitulo="Con esto filtramos cada tendencia para ti. Se guarda solo en tu teléfono."
      />

      <Text style={styles.seccion}>Biotipo</Text>
      <View style={styles.fila}>
        {BIOTIPOS.map((b) => (
          <Chip key={b.valor} etiqueta={b.etiqueta} activo={perfil.biotipo === b.valor} onPress={() => onCambiar(perfil.conBiotipo(b.valor))} />
        ))}
      </View>

      <Text style={styles.seccion}>Fototipo (escala de Fitzpatrick)</Text>
      <View style={styles.fila}>
        {[1, 2, 3, 4, 5, 6].map((n) => {
          const f = Fototipo.crear(n);
          return <Chip key={n} etiqueta={f.romano} activo={perfil.fototipo.valor === n} onPress={() => onCambiar(perfil.conFototipo(f))} />;
        })}
      </View>
      <Text style={styles.ayuda}>I–II: te quemas fácil · III–IV: a veces te quemas · V–VI: rara vez te quemas</Text>

      <Tarjeta estilo={styles.resumen}>
        <Text style={styles.resumenTitulo}>Tu perfil</Text>
        <Text style={styles.resumenTexto}>
          Piel {BIOTIPOS.find((b) => b.valor === perfil.biotipo)?.etiqueta.toLowerCase()} · Fototipo {perfil.fototipo.romano}
        </Text>
      </Tarjeta>

      <Tarjeta estilo={styles.desarrollo}>
        <View style={styles.etiquetaDesarrollo}>
          <Text style={styles.etiquetaTexto}>EN DESARROLLO</Text>
        </View>
        <Text style={styles.resumenTitulo}>Análisis facial en cabina</Text>
        <Text style={styles.textoDesarrollo}>
          Pronto, los resultados del analizador facial de LÚA llegarán a tu app con sugerencias revisadas por tu especialista.
        </Text>
      </Tarjeta>

      {onCerrarSesion ? <Boton titulo="Cerrar sesión" variante="secundario" onPress={onCerrarSesion} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: espacio.xl, gap: espacio.m },
  seccion: { color: colores.texto, fontWeight: '700', fontSize: 15, marginTop: espacio.s },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
  ayuda: { color: colores.texto3, fontSize: 12, lineHeight: 18 },
  resumen: { backgroundColor: colores.crema, marginTop: espacio.m },
  resumenTitulo: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.texto },
  resumenTexto: { color: colores.texto2, fontSize: 15 },
  desarrollo: { borderStyle: 'dashed', borderColor: colores.oro },
  etiquetaDesarrollo: { alignSelf: 'flex-start', backgroundColor: colores.arena, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radio.s },
  etiquetaTexto: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', color: colores.oroOscuro },
  textoDesarrollo: { color: colores.texto2, fontSize: 14, lineHeight: 20 },
});
