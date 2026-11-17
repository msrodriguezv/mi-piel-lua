import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Fototipo } from './src/domain/piel/Fototipo';
import { PerfilPiel } from './src/domain/piel/PerfilPiel';
import { BarraNavegacion, Pestana } from './src/presentation/components/BarraNavegacion';
import { AgendarScreen } from './src/presentation/screens/AgendarScreen';
import { MiPielScreen } from './src/presentation/screens/MiPielScreen';
import { MisCitasScreen } from './src/presentation/screens/MisCitasScreen';
import { TendenciasScreen } from './src/presentation/screens/TendenciasScreen';
import { colores } from './src/presentation/theme';

export default function App() {
  const [pestana, setPestana] = useState<Pestana>('piel');
  const [perfil, setPerfil] = useState(() => new PerfilPiel('mixta', Fototipo.crear(3)));
  const [versionCitas, setVersionCitas] = useState(0);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.pantalla}>
          {pestana === 'piel' && <MiPielScreen perfil={perfil} onCambiar={setPerfil} />}
          {pestana === 'tendencias' && <TendenciasScreen perfil={perfil} />}
          {pestana === 'agendar' && (
            <AgendarScreen onAgendada={() => { setVersionCitas((v) => v + 1); setPestana('citas'); }} />
          )}
          {pestana === 'citas' && <MisCitasScreen version={versionCitas} />}
        </View>
        <BarraNavegacion activa={pestana} onCambiar={setPestana} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colores.marfil },
  pantalla: { flex: 1 },
});
