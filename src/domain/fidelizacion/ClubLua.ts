import { VentanaRetoque } from '../citas/CalculadorRetoque';

export const PUNTOS_POR_SERVICIO = 10;
export const PUNTOS_EXTRA_RETOQUE_A_TIEMPO = 15;
export const PUNTOS_POR_REFERIDA = 30;

/** Entidad del contexto Fidelización: puntos del Club LÚA de una clienta. */
export class CuentaClubLua {
  private _puntos = 0;
  private readonly _historial: { motivo: string; puntos: number }[] = [];

  get puntos(): number { return this._puntos; }
  get historial(): readonly { motivo: string; puntos: number }[] { return this._historial; }

  private sumar(puntos: number, motivo: string): void {
    this._puntos += puntos;
    this._historial.push({ motivo, puntos });
  }

  registrarServicio(fechaServicio: Date, ventanaPrevia: VentanaRetoque | null): void {
    this.sumar(PUNTOS_POR_SERVICIO, 'Servicio realizado');
    if (ventanaPrevia && fechaServicio >= ventanaPrevia.desde && fechaServicio <= ventanaPrevia.hasta) {
      this.sumar(PUNTOS_EXTRA_RETOQUE_A_TIEMPO, 'Retoque a tiempo');
    }
  }

  registrarReferida(): void {
    this.sumar(PUNTOS_POR_REFERIDA, 'Amiga referida');
  }
}
