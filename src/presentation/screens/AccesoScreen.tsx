import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { contenedor } from '../../infrastructure/contenedor';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { Chip } from '../components/Chip';
import { colores, espacio, fuentes } from '../theme';
import { avisar, mensajeDe } from '../utils/avisar';

type Modo = 'ingresar' | 'registrarse';

/** Inicio de sesión y registro. Al entrar, App decide si muestra la app de clienta o el panel. */
export function AccesoScreen({ onIngreso }: { onIngreso: () => void }) {
  const [modo, setModo] = useState<Modo>('ingresar');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!correo.trim() || !contrasena) {
      avisar('Faltan datos', 'Escribe tu correo y tu contraseña.');
      return;
    }
    setEnviando(true);
    try {
      if (modo === 'ingresar') {
        await contenedor.auth.iniciarSesion(correo, contrasena);
        onIngreso();
      } else {
        const usuaria = await contenedor.auth.registrarse(nombre, correo, contrasena);
        if (usuaria) {
          onIngreso();
        } else {
          avisar('Revisa tu correo', 'Te enviamos un enlace para confirmar tu cuenta. Después inicia sesión aquí.');
          setModo('ingresar');
        }
      }
    } catch (e) {
      avisar('No se pudo continuar', mensajeDe(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.marca}>
          <Text style={styles.logo}>Lúa</Text>
          <Text style={styles.lema}>MIRADA & BIENESTAR</Text>
        </View>

        <Text style={styles.titulo}>{modo === 'ingresar' ? 'Bienvenida de nuevo' : 'Crea tu cuenta'}</Text>
        <Text style={styles.sub}>Lo viral, revisado por tu especialista para tu piel.</Text>

        <View style={styles.fila}>
          <Chip etiqueta="Iniciar sesión" activo={modo === 'ingresar'} onPress={() => setModo('ingresar')} />
          <Chip etiqueta="Registrarme" activo={modo === 'registrarse'} onPress={() => setModo('registrarse')} />
        </View>

        {modo === 'registrarse' ? (
          <CampoTexto etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Tu nombre" autoComplete="name" />
        ) : null}
        <CampoTexto
          etiqueta="Correo"
          value={correo}
          onChangeText={setCorreo}
          placeholder="tucorreo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <CampoTexto
          etiqueta="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          autoCapitalize="none"
        />

        <Boton
          titulo={enviando ? 'Un momento…' : modo === 'ingresar' ? 'Entrar' : 'Crear cuenta'}
          onPress={enviar}
          deshabilitado={enviando}
        />
        <Text style={styles.legal}>
          Tus datos de piel se guardan solo en tu teléfono. La ficha y las fotos clínicas solo las ve tu especialista.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { padding: espacio.xl, gap: espacio.l, paddingTop: espacio.xxl },
  marca: { alignItems: 'center', marginBottom: espacio.l },
  logo: { fontFamily: fuentes.titulo, fontSize: 44, color: colores.cafe },
  lema: { fontSize: 10, letterSpacing: 3, color: colores.oroOscuro, fontWeight: '600' },
  titulo: { fontFamily: fuentes.titulo, fontSize: 26, color: colores.texto },
  sub: { color: colores.texto2, fontSize: 14, marginTop: -espacio.s },
  fila: { flexDirection: 'row', gap: espacio.s },
  legal: { color: colores.texto3, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
