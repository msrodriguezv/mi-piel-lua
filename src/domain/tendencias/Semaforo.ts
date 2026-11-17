/** Resultado del semáforo: siempre se muestra con texto, nunca solo con color. */
export type EstadoSemaforo = 'funciona' | 'depende' | 'evitalo';

export const ETIQUETA_SEMAFORO: Record<EstadoSemaforo, string> = {
  funciona: 'Funciona',
  depende: 'Depende de tu piel',
  evitalo: 'Evítalo',
};

/** Orden para mostrar primero lo que conviene y al final lo que se debe evitar. */
export const PRIORIDAD_SEMAFORO: Record<EstadoSemaforo, number> = {
  funciona: 0,
  depende: 1,
  evitalo: 2,
};
