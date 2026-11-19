import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Usuaria } from './src/application/Autenticacion';
import { Fototipo } from './src/domain/piel/Fototipo';
import { PerfilPiel } from './src/domain/piel/PerfilPiel';
import { contenedor } from './src/infrastructure/contenedor';
import { BarraNavegacion, ItemNavegacion } from './src/presentation/components/BarraNavegacion';
import { AccesoScreen } from './src/presentation/screens/AccesoScreen';
import { AgendarScreen } from './src/presentation/screens/AgendarScreen';
import { MiPielScreen } from './src/presentation/screens/MiPielScreen';
import { MisCitasScreen } from './src/presentation/screens/MisCitasScreen';
import { PanelAgendaScreen } from './src/presentation/screens/panel/PanelAgendaScreen';
import { PanelFichasScreen } from './src/presentation/screens/panel/PanelFichasScreen';
import { PanelTendenciasScreen } from './src/presentation/screens/panel/PanelTendenciasScreen';
import { TendenciasScreen } from './src/presentation/screens/TendenciasScreen';
import { colores, espacio, fuentes } from './src/presentation/theme';
import { avisar, mensajeDe } from './src/presentation/utils/avisar';

type PestanaClienta = 'piel' | 'tendencias' | 'agendar' | 'citas';
type PestanaPanel = 'agenda' | 'fichas' | 'radar';

const PESTANAS_CLIENTA: ItemNavegacion<PestanaClienta>[] = [
  { id: 'piel', etiqueta: 'Mi piel', icono: '◐' },
  { id: 'tendencias', etiqueta: 'Tendencias', icono: '✦' },
  { id: 'agendar', etiqueta: 'Agendar', icono: '＋' },
  { id: 'citas', etiqueta: 'Mis citas', icono: '◷' },
];

const PESTANAS_PANEL: ItemNavegacion<PestanaPanel>[] = [
  { id: 'agenda', etiqueta: 'Agenda', icono: '◷' },
  { id: 'fichas', etiqueta: 'Fichas', icono: '▤' },
  { id: 'radar', etiqueta: 'Tendencias', icono: '✦' },
];

export default function App() {
  const [usuaria, setUsuaria] = useState<Usuaria | null>(null);
  const [cargando, setCargando] = useState(true);

  const revisarSesion = useCallback(async () => {
    try {
      setUsuaria(await contenedor.auth.sesionActual());
    } catch (e) {
      setUsuaria(null);
      avisar('No se pudo abrir tu sesión', mensajeDe(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void revisarSesion();
    return contenedor.auth.alCambiarSesion(() => void revisarSesion());
  }, [revisarSesion]);

  const cerrarSesion = contenedor.auth.requiereCuenta
    ? () => { void contenedor.auth.cerrarSesion().then(revisarSesion); }
    : undefined;

  let contenido: React.ReactNode;
  if (cargando) {
    contenido = <View style={styles.centro}><ActivityIndicator color={colores.oro} size="large" /></View>;
  } else if (!usuaria) {
    contenido = <AccesoScreen onIngreso={revisarSesion} />;
  } else if (usuaria.rol === 'especialista') {
    contenido = <AppEspecialista usuaria={usuaria} onCerrarSesion={cerrarSesion} />;
  } else {
    contenido = <AppClienta usuaria={usuaria} onCerrarSesion={cerrarSesion} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {contenido}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function AppClienta({ usuaria, onCerrarSesion }: { usuaria: Usuaria; onCerrarSesion?: () => void }) {
  const [pestana, setPestana] = useState<PestanaClienta>('piel');
  // El perfil de piel vive solo en el teléfono (no se envía a la base de datos).
  const [perfil, setPerfil] = useState(() => new PerfilPiel('mixta', Fototipo.crear(3)));
  const [versionCitas, setVersionCitas] = useState(0);

  return (
    <>
      <View style={styles.pantalla}>
        {pestana === 'piel' && (
          <MiPielScreen
            perfil={perfil}
            onCambiar={setPerfil}
            nombre={onCerrarSesion ? usuaria.nombre : undefined}
            onCerrarSesion={onCerrarSesion}
          />
        )}
        {pestana === 'tendencias' && <TendenciasScreen perfil={perfil} />}
        {pestana === 'agendar' && (
          <AgendarScreen onAgendada={() => { setVersionCitas((v) => v + 1); setPestana('citas'); }} />
        )}
        {pestana === 'citas' && <MisCitasScreen version={versionCitas} />}
      </View>
      <BarraNavegacion items={PESTANAS_CLIENTA} activa={pestana} onCambiar={setPestana} />
    </>
  );
}

function AppEspecialista({ usuaria, onCerrarSesion }: { usuaria: Usuaria; onCerrarSesion?: () => void }) {
  const [pestana, setPestana] = useState<PestanaPanel>('agenda');

  return (
    <>
      <View style={styles.cabecera}>
        <Text style={styles.marca}>Lúa · Panel</Text>
        <View style={styles.cabeceraDerecha}>
          <Text style={styles.nombre} numberOfLines={1}>{usuaria.nombre || 'Especialista'}</Text>
          {onCerrarSesion ? (
            <Pressable onPress={onCerrarSesion} accessibilityRole="button">
              <Text style={styles.salir}>Salir</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={styles.pantalla}>
        {pestana === 'agenda' && <PanelAgendaScreen />}
        {pestana === 'fichas' && <PanelFichasScreen />}
        {pestana === 'radar' && <PanelTendenciasScreen />}
      </View>
      <BarraNavegacion items={PESTANAS_PANEL} activa={pestana} onCambiar={setPestana} />
    </>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colores.marfil },
  pantalla: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: espacio.xl,
    paddingVertical: espacio.m,
    backgroundColor: colores.noche,
  },
  marca: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.oroClaro },
  cabeceraDerecha: { flexDirection: 'row', alignItems: 'center', gap: espacio.m, flexShrink: 1 },
  nombre: { color: colores.arena, fontSize: 13, flexShrink: 1 },
  salir: { color: colores.oroClaro, fontWeight: '700', fontSize: 13 },
});
