// Iconos de línea propios (24 × 24, trazo del color del texto). Decorativos: siempre con aria-hidden.
const TRAZOS = {
  // Mancuerna
  ejercicios: (
    <>
      <path d="M6.5 6.5v11M17.5 6.5v11M6.5 12h11" />
      <rect x="3" y="8" width="3.5" height="8" rx="1" />
      <rect x="17.5" y="8" width="3.5" height="8" rx="1" />
    </>
  ),
  // Hoja con lista marcada
  rutinas: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="m7.5 8.5 1.5 1.5 2.5-3M13.5 9h3M7.5 15.5l1.5 1.5 2.5-3M13.5 16h3" />
    </>
  ),
  // Manzana
  alimentos: (
    <>
      <path d="M12 7.5c-1.5-1.2-3.4-1.6-5-.9C4.6 7.6 3.8 10.6 4.6 13.6 5.5 17.3 8 21 10.2 21c.8 0 1.2-.4 1.8-.4s1 .4 1.8.4C16 21 18.5 17.3 19.4 13.6c.8-3-.1-6-2.4-7-1.6-.7-3.5-.3-5 .9Z" />
      <path d="M12 7.5c0-2 1-3.8 3-4.5" />
    </>
  ),
  // Olla con vapor
  recetas: (
    <>
      <path d="M4 11h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5ZM2 11h2M20 11h2" />
      <path d="M9 3.5c-.6.8-.6 1.7 0 2.5s.6 1.7 0 2.5M15 3.5c-.6.8-.6 1.7 0 2.5s.6 1.7 0 2.5" />
    </>
  ),
  // Libro abierto
  guias: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  // Gráfica que sube
  progreso: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 6-6M15 8h5v5" />
    </>
  ),
  // Diana
  objetivos: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
} as const;

export type NombreIcono = keyof typeof TRAZOS;

export default function Icono({ nombre, className = "h-8 w-8" }: { nombre: NombreIcono; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
