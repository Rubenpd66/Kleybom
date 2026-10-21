import { useEffect, useState, useSyncExternalStore } from "react";

export type EstadoTemporizador = { remaining: number; running: boolean };

// Temporizador de descanso sin React (se prueba con reloj simulado). Calcula lo que queda a partir
// de la hora de fin, así que no se desajusta si el navegador retrasa los avisos.
export function createRestTimer() {
  let fin = 0;
  let intervalo: ReturnType<typeof setInterval> | null = null;
  let estado: EstadoTemporizador = { remaining: 0, running: false };
  const oyentes = new Set<() => void>();

  const avisar = () => oyentes.forEach((o) => o());
  const parar = () => {
    if (intervalo) clearInterval(intervalo);
    intervalo = null;
  };
  const tic = () => {
    const quedan = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
    if (quedan === estado.remaining && estado.running === quedan > 0) return;
    estado = { remaining: quedan, running: quedan > 0 };
    if (quedan === 0) parar();
    avisar();
  };

  return {
    get: () => estado,
    subscribe(oyente: () => void) {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    start(segundos: number) {
      if (!Number.isFinite(segundos) || segundos <= 0) return;
      parar();
      fin = Date.now() + Math.round(segundos) * 1000;
      estado = { remaining: Math.round(segundos), running: true };
      avisar();
      intervalo = setInterval(tic, 1000);
    },
    stop() {
      parar();
      estado = { remaining: 0, running: false };
      avisar();
    },
  };
}

export function useRestTimer(): EstadoTemporizador & { start(seconds: number): void; stop(): void } {
  const [temporizador] = useState(createRestTimer);
  const estado = useSyncExternalStore(temporizador.subscribe, temporizador.get, temporizador.get);
  useEffect(() => () => temporizador.stop(), [temporizador]);
  return { ...estado, start: temporizador.start, stop: temporizador.stop };
}
