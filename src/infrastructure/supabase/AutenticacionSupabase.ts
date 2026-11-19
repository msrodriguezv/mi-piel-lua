import { SupabaseClient } from '@supabase/supabase-js';
import { AutenticacionGateway, Usuaria } from '../../application/Autenticacion';

const MENSAJES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Primero confirma tu correo con el enlace que te enviamos.',
  'User already registered': 'Ese correo ya tiene una cuenta. Inicia sesión.',
};

function traducir(error: { message: string } | null): void {
  if (!error) return;
  if (error.message.includes('Password should be at least')) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }
  throw new Error(MENSAJES[error.message] ?? error.message);
}

export class AutenticacionSupabase implements AutenticacionGateway {
  readonly requiereCuenta = true;

  constructor(private readonly db: SupabaseClient) {}

  private async perfil(id: string): Promise<Usuaria> {
    const { data, error } = await this.db.from('perfiles').select('id, nombre, rol').eq('id', id).single();
    if (error || !data) throw new Error('No se encontró tu perfil. Intenta de nuevo.');
    return data as Usuaria;
  }

  async sesionActual(): Promise<Usuaria | null> {
    const { data } = await this.db.auth.getSession();
    return data.session ? this.perfil(data.session.user.id) : null;
  }

  async iniciarSesion(correo: string, contrasena: string): Promise<Usuaria> {
    const { data, error } = await this.db.auth.signInWithPassword({ email: correo.trim(), password: contrasena });
    traducir(error);
    return this.perfil(data.user!.id);
  }

  async registrarse(nombre: string, correo: string, contrasena: string): Promise<Usuaria | null> {
    if (!nombre.trim()) throw new Error('Escribe tu nombre.');
    const { data, error } = await this.db.auth.signUp({
      email: correo.trim(),
      password: contrasena,
      options: { data: { nombre: nombre.trim() } },
    });
    traducir(error);
    return data.session && data.user ? this.perfil(data.user.id) : null;
  }

  async cerrarSesion(): Promise<void> {
    await this.db.auth.signOut();
  }

  alCambiarSesion(callback: () => void): () => void {
    // setTimeout evita llamar a Supabase dentro de su propio evento (recomendación oficial).
    const { data } = this.db.auth.onAuthStateChange(() => setTimeout(callback, 0));
    return () => data.subscription.unsubscribe();
  }
}
