import { AutenticacionGateway, Usuaria } from '../../application/Autenticacion';

/** Modo demostración: una clienta invitada, sin cuentas ni base de datos. */
export class AutenticacionDemo implements AutenticacionGateway {
  readonly requiereCuenta = false;
  private readonly invitada: Usuaria = { id: 'demo', nombre: 'Invitada', rol: 'clienta' };

  async sesionActual(): Promise<Usuaria | null> {
    return this.invitada;
  }

  async iniciarSesion(): Promise<Usuaria> {
    return this.invitada;
  }

  async registrarse(): Promise<Usuaria | null> {
    return this.invitada;
  }

  async cerrarSesion(): Promise<void> {}

  alCambiarSesion(): () => void {
    return () => {};
  }
}
