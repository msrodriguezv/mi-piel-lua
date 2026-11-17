import { Biotipo } from './Biotipo';
import { Fototipo } from './Fototipo';

/**
 * Perfil de piel que elige la clienta en la app.
 * Se guarda solo en su teléfono: no viaja a ningún servidor.
 */
export class PerfilPiel {
  constructor(
    readonly biotipo: Biotipo,
    readonly fototipo: Fototipo,
  ) {}

  conBiotipo(biotipo: Biotipo): PerfilPiel {
    return new PerfilPiel(biotipo, this.fototipo);
  }

  conFototipo(fototipo: Fototipo): PerfilPiel {
    return new PerfilPiel(this.biotipo, fototipo);
  }
}
