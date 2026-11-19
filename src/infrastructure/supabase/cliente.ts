import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

/**
 * Cliente de Supabase. Usa solo la clave PÚBLICA (publishable/anon):
 * la seguridad real la ponen las políticas RLS de la base de datos.
 */
export function crearClienteSupabase(url: string, clavePublica: string): SupabaseClient {
  const cliente = createClient(url, clavePublica, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  // Renueva la sesión solo mientras la app está abierta (recomendación de Supabase para móviles).
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (estado) => {
      if (estado === 'active') cliente.auth.startAutoRefresh();
      else cliente.auth.stopAutoRefresh();
    });
  }
  return cliente;
}

/** Convierte un error de Supabase en un Error con un mensaje legible. */
export function falla(error: { message: string } | null): void {
  if (!error) return;
  if (error.message.includes('citas_horario_unico')) throw new Error('Ese horario ya está reservado. Elige otro.');
  if (error.message.includes('row-level security')) throw new Error('No tienes permiso para esta acción.');
  throw new Error(error.message);
}
