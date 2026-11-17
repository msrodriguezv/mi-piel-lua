import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TendenciaParaMiPiel } from '../../application/ObtenerTendenciasParaMiPiel';
import { PerfilPiel } from '../../domain/piel/PerfilPiel';
import { contenedor } from '../../infrastructure/contenedor';
import { BadgeSemaforo } from '../components/BadgeSemaforo';
import { Encabezado } from '../components/Encabezado';
import { Tarjeta } from '../components/Tarjeta';
import { colores, espacio, fuentes } from '../theme';

export function TendenciasScreen({ perfil }: { perfil: PerfilPiel }) {
  const [items, setItems] = useState<TendenciaParaMiPiel[] | null>(null);

  useEffect(() => {
    let activo = true;
    contenedor.obtenerTendencias.ejecutar(perfil).then((r) => activo && setItems(r));
    return () => { activo = false; };
  }, [perfil]);

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Encabezado
        antetitulo="RADAR DE TENDENCIAS"
        titulo="¿Le sirve a tu piel?"
        subtitulo={`Lo viral de la semana, revisado por tu especialista para fototipo ${perfil.fototipo.romano} y piel ${perfil.biotipo}.`}
      />
      {!items ? <ActivityIndicator color={colores.oro} /> : null}
      {items?.map(({ tendencia, resultado }) => (
        <Tarjeta key={tendencia.id}>
          <BadgeSemaforo estado={resultado.estado} />
          <Text style={styles.nombre}>{tendencia.nombre}</Text>
          <Text style={styles.hashtag}>{tendencia.hashtag}</Text>
          <Text style={styles.nota}>{resultado.nota}</Text>
          {resultado.precaucionFototipo ? (
            <Text style={styles.precaucion}>☀ Fototipo {perfil.fototipo.romano}: {resultado.precaucionFototipo}</Text>
          ) : null}
          <View style={styles.proscontras}>
            {tendencia.pros.map((p) => <Text key={p} style={styles.pro}>+ {p}</Text>)}
            {tendencia.contras.map((c) => <Text key={c} style={styles.contra}>– {c}</Text>)}
          </View>
        </Tarjeta>
      ))}
      <Text style={styles.legal}>
        Orientación general, no reemplaza una valoración. Si tienes dudas, agenda tu cita.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: espacio.xl, gap: espacio.m },
  nombre: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.texto },
  hashtag: { color: colores.oroOscuro, fontSize: 12 },
  nota: { color: colores.texto2, fontSize: 14, lineHeight: 20 },
  precaucion: { color: colores.cafe, fontSize: 13, backgroundColor: colores.crema, padding: espacio.s, borderRadius: 8 },
  proscontras: { gap: 2, marginTop: espacio.xs },
  pro: { color: '#3F6B47', fontSize: 13 },
  contra: { color: '#9A3A30', fontSize: 13 },
  legal: { color: colores.texto3, fontSize: 12, textAlign: 'center', marginTop: espacio.s },
});
