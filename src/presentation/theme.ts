import { Platform } from 'react-native';
import { EstadoSemaforo } from '../domain/tendencias/Semaforo';

export const colores = {
  oro: '#B89A6F',
  oroClaro: '#D5BA8C',
  oroOscuro: '#7E6239',
  cafe: '#472E17',
  noche: '#1C1612',
  marfil: '#FAF6F0',
  crema: '#F3ECE2',
  arena: '#E8DCCB',
  texto: '#2B1D10',
  texto2: '#5E4A38',
  texto3: '#76614E',
  blanco: '#FFFFFF',
};

export const semaforo: Record<EstadoSemaforo, { texto: string; fondo: string }> = {
  funciona: { texto: '#3F6B47', fondo: '#E3EEE2' },
  depende: { texto: '#8A5A12', fondo: '#F6EAD4' },
  evitalo: { texto: '#9A3A30', fondo: '#F6DFDB' },
};

export const fuentes = {
  titulo: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  cuerpo: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
};

export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };
export const radio = { s: 8, m: 14, l: 22, pill: 999 };
