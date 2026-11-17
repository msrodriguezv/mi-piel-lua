import { DatosTendencia } from '../../domain/tendencias/Tendencia';

/**
 * Datos de ejemplo. En producción provienen del radar (Apify, solo métricas
 * agregadas de hashtags) y de la evaluación de la especialista.
 */
export const TENDENCIAS_SEMILLA: DatosTendencia[] = [
  {
    id: 'protector-solar-diario',
    nombre: 'Protector solar todos los días',
    hashtag: '#sunscreen',
    pros: ['Previene manchas y fotoenvejecimiento', 'Indispensable en Quito por la radiación UV alta'],
    contras: ['Algunas fórmulas dejan brillo o residuo blanco'],
    evaluaciones: {
      normal: { estado: 'funciona', nota: 'Úsalo cada mañana y reaplica cada 2–3 horas al aire libre.' },
      seca: { estado: 'funciona', nota: 'Elige texturas en crema con hidratantes.' },
      grasa: { estado: 'funciona', nota: 'Prefiere fluidos oil-free o toque seco.' },
      mixta: { estado: 'funciona', nota: 'Un fluido ligero equilibra zona T y mejillas.' },
      sensible: { estado: 'funciona', nota: 'Mejor filtros minerales, sin perfume.' },
    },
    precaucionesFototipo: { 'I-II': 'Tu piel se quema fácil: FPS 50+ y reaplicación estricta.' },
    confiabilidad: 'alta',
    validadaPorEspecialista: true,
  },
  {
    id: 'retinol-noche',
    nombre: 'Retinol de noche',
    hashtag: '#retinol',
    pros: ['Mejora textura y líneas finas', 'Ayuda con poros y acné leve'],
    contras: ['Irrita al inicio', 'Aumenta la sensibilidad al sol'],
    evaluaciones: {
      normal: { estado: 'funciona', nota: 'Empieza 2 noches por semana en baja concentración.' },
      seca: { estado: 'depende', nota: 'Úsalo sobre hidratante (técnica sándwich).' },
      grasa: { estado: 'funciona', nota: 'Buen aliado para poros y textura.' },
      mixta: { estado: 'funciona', nota: 'Introdúcelo poco a poco.' },
      sensible: { estado: 'evitalo', nota: 'Consulta primero; hay alternativas más suaves como el bakuchiol.' },
    },
    precaucionesFototipo: { 'V-VI': 'Si se irrita, puede dejar manchas oscuras: avanza lento.' },
    confiabilidad: 'media',
    validadaPorEspecialista: true,
  },
  {
    id: 'acido-salicilico',
    nombre: 'Ácido salicílico (BHA)',
    hashtag: '#salicylicacid',
    pros: ['Destapa poros', 'Controla el brillo'],
    contras: ['Puede resecar si se usa en exceso'],
    evaluaciones: {
      normal: { estado: 'depende', nota: 'Solo si tienes puntos negros ocasionales.' },
      seca: { estado: 'evitalo', nota: 'Tiende a resecar más tu piel.' },
      grasa: { estado: 'funciona', nota: '2–3 veces por semana en la noche.' },
      mixta: { estado: 'funciona', nota: 'Aplícalo solo en la zona T.' },
      sensible: { estado: 'evitalo', nota: 'Puede irritar; consúltalo en cabina.' },
    },
    precaucionesFototipo: {},
    confiabilidad: 'alta',
    validadaPorEspecialista: true,
  },
  {
    id: 'limon-en-la-cara',
    nombre: 'Limón directo en la cara',
    hashtag: '#lemonskincare',
    pros: ['Ninguno comprobado frente a alternativas seguras'],
    contras: ['Puede causar quemaduras con el sol (fitofotodermatitis)', 'Mancha la piel'],
    evaluaciones: {
      normal: { estado: 'evitalo', nota: 'Usa vitamina C formulada en su lugar.' },
      seca: { estado: 'evitalo', nota: 'Irrita y reseca.' },
      grasa: { estado: 'evitalo', nota: 'No controla el brillo y daña la barrera.' },
      mixta: { estado: 'evitalo', nota: 'Usa vitamina C formulada en su lugar.' },
      sensible: { estado: 'evitalo', nota: 'Alto riesgo de reacción.' },
    },
    precaucionesFototipo: { 'III-IV': 'Riesgo alto de manchas.', 'V-VI': 'Riesgo alto de manchas.' },
    confiabilidad: 'alta',
    validadaPorEspecialista: true,
  },
  {
    id: 'mascarilla-viral-sin-validar',
    nombre: 'Mascarilla viral (pendiente)',
    hashtag: '#glassskin',
    pros: [],
    contras: [],
    evaluaciones: {
      normal: { estado: 'depende', nota: '' },
      seca: { estado: 'depende', nota: '' },
      grasa: { estado: 'depende', nota: '' },
      mixta: { estado: 'depende', nota: '' },
      sensible: { estado: 'depende', nota: '' },
    },
    precaucionesFototipo: {},
    confiabilidad: 'baja',
    validadaPorEspecialista: false, // no se publica hasta que la especialista la revise
  },
];
