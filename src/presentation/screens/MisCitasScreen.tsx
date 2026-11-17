import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RecordatorioRetoque } from '../../application/CalcularProximoRetoque';
import { Cita, EstadoCita } from '../../domain/citas/Cita';
import { PUNTOS_POR_SERVICIO } from '../../domain/fidelizacion/ClubLua';
import { contenedor } from '../../infrastructure/contenedor';
import { Encabezado } from '../components/Encabezado';
import { Tarjeta } from '../components/Tarjeta';
import { colores, espacio, fuentes, radio } from '../theme';

const ETIQUETA_ESTADO: Record<EstadoCita, string> = {
  pendiente_anticipo: 'Pendiente de anticipo',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
};

const fecha = (d: Date) => d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });

export function MisCitasScreen({ version }: { version: number }) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [retoques, setRetoques] = useState<RecordatorioRetoque[]>([]);

  useEffect(() => {
    contenedor.citas.listar().then(setCitas);
    contenedor.calcularRetoque.ejecutar().then(setRetoques);
  }, [version]);

  const puntos = citas.filter((c) => c.estado === 'realizada').length * PUNTOS_POR_SERVICIO;

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Encabezado antetitulo="MIS CITAS" titulo="Tu agenda LÚA" />

      {retoques.map((r) => (
        <Tarjeta key={r.servicio} estilo={styles.retoque}>
          <Text style={styles.retoqueAnte}>RECORDATORIO DE RETOQUE</Text>
          <Text style={styles.retoqueTitulo}>{r.servicio}</Text>
          <Text style={styles.retoqueTexto}>
            {r.diasRestantes > 0
              ? `Tu retoque ideal empieza en ${r.diasRestantes} días (${fecha(r.ventana.desde)}).`
              : `¡Ya es momento de tu retoque! Ideal hasta el ${fecha(r.ventana.hasta)}.`}
          </Text>
        </Tarjeta>
      ))}

      <Tarjeta estilo={styles.club}>
        <Text style={styles.clubTitulo}>Club LÚA</Text>
        <Text style={styles.clubPuntos}>{puntos} puntos</Text>
        <Text style={styles.clubTexto}>Suma puntos con cada servicio, retoques a tiempo y amigas referidas.</Text>
      </Tarjeta>

      {citas.map((c) => (
        <Tarjeta key={c.id}>
          <View style={styles.filaCita}>
            <Text style={styles.servicio}>{c.servicio.nombre}</Text>
            <Text style={styles.estado}>{ETIQUETA_ESTADO[c.estado]}</Text>
          </View>
          <Text style={styles.detalle}>{fecha(c.fechaHora)} · {c.fechaHora.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</Text>
          {c.codigo ? <Text style={styles.detalle}>Código {c.codigo.codigo} (−{c.codigo.porcentaje}%)</Text> : null}
          {c.anticipo ? <Text style={styles.detalle}>Anticipo ${c.anticipo.monto.toFixed(2)} vía {c.anticipo.metodo}</Text> : null}
        </Tarjeta>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: espacio.xl, gap: espacio.m },
  retoque: { backgroundColor: colores.cafe, borderColor: colores.cafe },
  retoqueAnte: { color: colores.oroClaro, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  retoqueTitulo: { color: colores.marfil, fontFamily: fuentes.titulo, fontSize: 22 },
  retoqueTexto: { color: colores.arena, fontSize: 14, lineHeight: 20 },
  club: { backgroundColor: colores.crema },
  clubTitulo: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.texto },
  clubPuntos: { fontSize: 26, fontWeight: '700', color: colores.oroOscuro },
  clubTexto: { color: colores.texto2, fontSize: 13 },
  filaCita: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espacio.s },
  servicio: { fontWeight: '700', color: colores.texto, fontSize: 15, flexShrink: 1 },
  estado: { fontSize: 12, color: colores.oroOscuro, backgroundColor: colores.crema, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radio.pill, overflow: 'hidden' },
  detalle: { color: colores.texto2, fontSize: 13 },
});
