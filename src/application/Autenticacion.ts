export type RolUsuaria = 'clienta' | 'especialista';

export interface Usuaria {
  id: string;
  nombre: string;
  rol: RolUsuaria;
}

/** Puerto de autenticación: la app no sabe si detrás está Supabase u otro servicio. */
export interface AutenticacionGateway {
  /** false = modo demostración sin cuentas (datos en memoria). */
  readonly requiereCuenta: boolean;
  sesionActual(): Promise<Usuaria | null>;
  iniciarSesion(correo: string, contrasena: string): Promise<Usuaria>;
  /** Devuelve null si la cuenta debe confirmarse por correo antes de entrar. */
  registrarse(nombre: string, correo: string, contrasena: string): Promise<Usuaria | null>;
  cerrarSesion(): Promise<void>;
  alCambiarSesion(callback: () => void): () => void;
}
