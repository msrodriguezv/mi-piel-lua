import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ClientaResumen, FotoClinica } from '../../../application/PanelEspecialista';
import { contenedor } from '../../../infrastructure/contenedor';
import { Boton } from '../../components/Boton';
import { CampoTexto } from '../../components/CampoTexto';
import { Chip } from '../../components/Chip';
import { Encabezado } from '../../components/Encabezado';
import { Tarjeta } from '../../components/Tarjeta';
import { colores, espacio, fuentes, radio } from '../../theme';
import { avisar, mensajeDe } from '../../utils/avisar';

/** Lista de clientas → ficha estética con consentimiento, alergias, notas y fotos privadas. */
export function PanelFichasScreen() {
  const [clientas, setClientas] = useState<ClientaResumen[] | null>(null);
  const [filtro, setFiltro] = useState('');
  const [seleccionada, setSeleccionada] = useState<ClientaResumen | null>(null);

  useEffect(() => {
    contenedor.panel
      ?.clientas()
      .then(setClientas)
      .catch((e) => {
        setClientas([]);
        avisar('No se pudieron cargar las clientas', mensajeDe(e));
      });
  }, []);

  if (seleccionada) return <FichaDetalle clienta={seleccionada} onVolver={() => setSeleccionada(null)} />;

  const visibles = (clientas ?? []).filter((c) => c.nombre.toLowerCase().includes(filtro.trim().toLowerCase()));

  return (
    <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
      <Encabezado antetitulo="PANEL DE LA ESPECIALISTA" titulo="Fichas estéticas" subtitulo="Información sensible: solo tú puedes verla." />
      <CampoTexto etiqueta="Buscar clienta" value={filtro} onChangeText={setFiltro} placeholder="Nombre" />
      {!clientas ? <ActivityIndicator color={colores.oro} /> : null}
      {clientas && visibles.length === 0 ? <Text style={styles.ayuda}>No hay clientas registradas con ese nombre.</Text> : null}
      {visibles.map((c) => (
        <Pressable key={c.id} onPress={() => setSeleccionada(c)} accessibilityRole="button">
          <Tarjeta>
            <Text style={styles.nombre}>{c.nombre || 'Clienta sin nombre'}</Text>
            <Text style={styles.ayuda}>Ver ficha ›</Text>
          </Tarjeta>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function FichaDetalle({ clienta, onVolver }: { clienta: ClientaResumen; onVolver: () => void }) {
  const [cargando, setCargando] = useState(true);
  const [tratamiento, setTratamiento] = useState(false);
  const [alergiasOk, setAlergiasOk] = useState(false);
  const [fotosOk, setFotosOk] = useState(false);
  const [firmadoEn, setFirmadoEn] = useState<Date | null>(null);
  const [alergias, setAlergias] = useState('');
  const [notas, setNotas] = useState('');
  const [fotos, setFotos] = useState<FotoClinica[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = useCallback(async () => {
    if (!contenedor.panel) return;
    setCargando(true);
    try {
      const ficha = await contenedor.panel.ficha(clienta.id);
      setTratamiento(ficha.consentimiento?.tratamiento ?? false);
      setAlergiasOk(ficha.consentimiento?.alergias ?? false);
      setFotosOk(ficha.consentimiento?.fotosClinicas ?? false);
      setFirmadoEn(ficha.consentimiento?.firmadoEn ?? null);
      setAlergias(ficha.alergias.join(', '));
      setNotas(ficha.notas);
      setFotos(await contenedor.panel.fotos(clienta.id));
    } catch (e) {
      avisar('No se pudo cargar la ficha', mensajeDe(e));
    } finally {
      setCargando(false);
    }
  }, [clienta.id]);

  useEffect(() => { void cargar(); }, [cargar]);

  async function guardar() {
    if (!contenedor.panel) return;
    setGuardando(true);
    try {
      const algunConsentimiento = tratamiento || alergiasOk || fotosOk;
      const fecha = algunConsentimiento ? firmadoEn ?? new Date() : null;
      await contenedor.panel.guardarFicha(clienta.id, {
        alergias: alergias.split(',').map((a) => a.trim()).filter(Boolean),
        notas,
        consentimiento: fecha
          ? { tratamiento, alergias: alergiasOk, fotosClinicas: fotosOk, firmadoEn: fecha }
          : null,
      });
      setFirmadoEn(fecha);
      avisar('Ficha guardada');
    } catch (e) {
      avisar('No se pudo guardar', mensajeDe(e));
    } finally {
      setGuardando(false);
    }
  }

  async function agregarFoto() {
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (resultado.canceled || !resultado.assets[0]) return;
    setSubiendo(true);
    try {
      await contenedor.subirFoto?.ejecutar(clienta.id, resultado.assets[0].uri);
      if (contenedor.panel) setFotos(await contenedor.panel.fotos(clienta.id));
    } catch (e) {
      avisar('No se pudo subir la foto', mensajeDe(e));
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
      <Pressable onPress={onVolver} accessibilityRole="button">
        <Text style={styles.volver}>‹ Volver a la lista</Text>
      </Pressable>
      <Encabezado antetitulo="FICHA ESTÉTICA" titulo={clienta.nombre || 'Clienta sin nombre'} />
      {cargando ? <ActivityIndicator color={colores.oro} /> : null}

      <Tarjeta>
        <Text style={styles.subtitulo}>Consentimiento informado</Text>
        <Text style={styles.ayuda}>
          {firmadoEn ? `Firmado el ${firmadoEn.toLocaleDateString('es-EC')}` : 'Aún no firmado. Regístralo cuando la clienta lo firme.'}
        </Text>
        <Consentimiento etiqueta="Acepta el tratamiento" valor={tratamiento} onCambiar={setTratamiento} />
        <Consentimiento etiqueta="Declaró sus alergias" valor={alergiasOk} onCambiar={setAlergiasOk} />
        <Consentimiento etiqueta="Autoriza fotos clínicas" valor={fotosOk} onCambiar={setFotosOk} />
      </Tarjeta>

      <CampoTexto etiqueta="Alergias (separadas por coma)" value={alergias} onChangeText={setAlergias} placeholder="Ej. látex, cianoacrilato" />
      <CampoTexto
        etiqueta="Notas de la especialista"
        value={notas}
        onChangeText={setNotas}
        placeholder="Productos usados, observaciones…"
        multiline
        style={styles.notas}
      />
      <Boton titulo={guardando ? 'Guardando…' : 'Guardar ficha'} onPress={guardar} deshabilitado={guardando || cargando} />

      <Text style={styles.subtitulo}>Fotos de antes y después</Text>
      <Text style={styles.ayuda}>Privadas: se guardan en un espacio cerrado y solo tú puedes abrirlas.</Text>
      <View style={styles.galeria}>
        {fotos.map((f) => (
          <View key={f.id} style={styles.foto}>
            <Image source={{ uri: f.url }} style={styles.imagen} />
            <Text style={styles.fecha}>{f.fecha.toLocaleDateString('es-EC')}</Text>
          </View>
        ))}
      </View>
      <Boton
        titulo={subiendo ? 'Subiendo…' : 'Agregar foto'}
        variante="secundario"
        onPress={agregarFoto}
        deshabilitado={subiendo || !fotosOk}
      />
      {!fotosOk ? <Text style={styles.ayuda}>Para subir fotos, registra y guarda la autorización de fotos clínicas.</Text> : null}
    </ScrollView>
  );
}

function Consentimiento({ etiqueta, valor, onCambiar }: { etiqueta: string; valor: boolean; onCambiar: (v: boolean) => void }) {
  return (
    <View style={styles.consentimiento}>
      <Text style={styles.etiquetaConsentimiento}>{etiqueta}</Text>
      <View style={styles.fila}>
        <Chip etiqueta="Sí" activo={valor} onPress={() => onCambiar(true)} />
        <Chip etiqueta="No" activo={!valor} onPress={() => onCambiar(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: espacio.xl, gap: espacio.m, paddingBottom: espacio.xxl },
  nombre: { fontFamily: fuentes.titulo, fontSize: 18, color: colores.texto },
  ayuda: { color: colores.texto3, fontSize: 13 },
  volver: { color: colores.oroOscuro, fontWeight: '600', fontSize: 14 },
  subtitulo: { fontWeight: '700', fontSize: 15, color: colores.texto, marginTop: espacio.s },
  consentimiento: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacio.s },
  etiquetaConsentimiento: { color: colores.texto2, fontSize: 14, flexShrink: 1 },
  fila: { flexDirection: 'row', gap: espacio.s },
  notas: { minHeight: 90, textAlignVertical: 'top' },
  galeria: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
  foto: { width: '48%', gap: 4 },
  imagen: { width: '100%', aspectRatio: 3 / 4, borderRadius: radio.s, backgroundColor: colores.crema },
  fecha: { color: colores.texto3, fontSize: 12 },
});
