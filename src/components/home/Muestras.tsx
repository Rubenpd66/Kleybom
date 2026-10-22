import Link from "@/components/ui/Link";
import type { ReactNode } from "react";
import Icono from "@/components/ui/Icono";

type Texto = { titulo: string; texto: string; enlace: string };

// Días de ejemplo del mes: hecho, planificado y hoy (el resto, vacíos).
const HECHOS = new Set([1, 3, 5, 8, 10, 12, 15]);
const PLANIFICADOS = new Set([19, 22, 24, 26]);
const HOY = 17;

// Mini calendario dibujado: 5 semanas de 7 días.
function DibujoCalendario() {
  return (
    <div className="grid w-full max-w-[17rem] grid-cols-7 gap-1.5">
      {Array.from({ length: 7 }, (_, i) => (
        <span key={`c${i}`} className="mx-auto mb-1 h-1.5 w-4 rounded-full bg-linea" />
      ))}
      {Array.from({ length: 35 }, (_, i) => {
        const d = i + 1;
        const estilo = HECHOS.has(d)
          ? "bg-temple"
          : PLANIFICADOS.has(d)
            ? "border-[1.5px] border-dashed border-temple-osc"
            : d === HOY
              ? "border-2 border-hierro"
              : "bg-realce";
        return <span key={d} className={`aspect-square rounded-md ${estilo}`} />;
      })}
    </div>
  );
}

// Anillo de macros (proteínas, hidratos, grasas) con sus barras.
function DibujoCalculadora() {
  const arcos = [
    { valor: 30, inicio: 0, color: "var(--temple)" },
    { valor: 45, inicio: 30, color: "var(--hierro)" },
    { valor: 25, inicio: 75, color: "var(--acero)" },
  ];
  return (
    <div className="flex w-full max-w-[17rem] items-center gap-6">
      <svg viewBox="0 0 42 42" className="h-32 w-32 shrink-0 -rotate-90">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--linea)" strokeWidth="5" />
        {arcos.map((a) => (
          <circle
            key={a.inicio}
            cx="21"
            cy="21"
            r="15.9"
            fill="none"
            stroke={a.color}
            strokeWidth="5"
            pathLength={100}
            strokeDasharray={`${a.valor - 1.5} ${101.5 - a.valor}`}
            strokeDashoffset={-a.inicio}
          />
        ))}
      </svg>
      <div className="flex flex-1 flex-col gap-3">
        {arcos.map((a) => (
          <span key={a.inicio} className="h-2.5 rounded-full" style={{ width: `${a.valor * 2}%`, background: a.color }} />
        ))}
      </div>
    </div>
  );
}

// Tres guías apiladas, un poco giradas.
function DibujoGuias() {
  return (
    <div className="relative h-40 w-full max-w-[15rem]">
      {[-6, 3, 0].map((giro, i) => (
        <div
          key={i}
          className="absolute inset-x-4 top-3 flex h-32 flex-col gap-2 rounded-xl border border-linea bg-papel p-4 shadow-md"
          style={{ transform: `rotate(${giro}deg) translateY(${i * 6}px)` }}
        >
          <Icono nombre="guias" className="h-7 w-7 text-temple-osc" />
          <span className="h-2 w-3/4 rounded-full bg-hierro/70" />
          <span className="h-1.5 w-full rounded-full bg-linea" />
          <span className="h-1.5 w-5/6 rounded-full bg-linea" />
        </div>
      ))}
    </div>
  );
}

// Muestras de calendario, calculadora y guías debajo de los accesos de la portada:
// un dibujo, una frase y un enlace a la sección. Se alternan a izquierda y derecha.
export default function Muestras({
  etiqueta,
  textos,
}: {
  etiqueta: string;
  textos: { calendario: Texto; calculadora: Texto; guias: Texto };
}) {
  const muestras: { href: string; t: Texto; dibujo: ReactNode }[] = [
    { href: "/calendario", t: textos.calendario, dibujo: <DibujoCalendario /> },
    { href: "/nutricion/objetivos", t: textos.calculadora, dibujo: <DibujoCalculadora /> },
    { href: "/guias", t: textos.guias, dibujo: <DibujoGuias /> },
  ];

  return (
    <section aria-label={etiqueta} className="mx-auto flex max-w-[1520px] lg:px-10 2xl:px-16 flex-col gap-6 px-6 pb-24">
      {muestras.map(({ href, t, dibujo }, i) => (
        <article
          key={href}
          className="grid items-center gap-8 rounded-3xl border border-linea bg-papel/70 p-6 backdrop-blur-sm md:grid-cols-2 md:p-10"
        >
          <div aria-hidden="true" className={`flex justify-center ${i % 2 ? "md:order-2" : ""}`}>
            {dibujo}
          </div>
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-none md:text-5xl">{t.titulo}</h2>
            <p className="mt-4 max-w-md text-lg text-acero">{t.texto}</p>
            <Link
              href={href}
              className="acceso mt-6 inline-flex items-center gap-2 rounded-full bg-hierro px-6 py-3 font-bold text-tiza hover:bg-temple hover:text-tinta"
            >
              {t.enlace}
              <span aria-hidden="true" className="flecha">
                →
              </span>
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
