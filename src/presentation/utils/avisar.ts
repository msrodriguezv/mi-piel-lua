import { Alert, Platform } from 'react-native';

/** Muestra un aviso en el celular y también en la versión web (donde Alert no existe). */
export function avisar(titulo: string, mensaje?: string): void {
  if (Platform.OS === 'web') {
    window.alert(mensaje ? `${titulo}\n\n${mensaje}` : titulo);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

/** Mensaje legible de cualquier error. */
export function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : 'Intenta de nuevo.';
}
