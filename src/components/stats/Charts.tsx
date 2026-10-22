// Gráficos SVG propios, sin librerías: barras (una serie) y líneas (hasta 2 series).
// Cada gráfico lleva un resumen accesible, un detalle por elemento al pasar el ratón (<title>)
// y una tabla con los datos como alternativa.
import type { ReactNode } from "react";
import type { Punto } from "@/lib/stats/aggregate";
import { getT } from "@/lib/i18n/servidor";
import { escalaY } from "@/lib/stats/chart";

const ANCHO = 400;
const ALTO = 210;
const M = { arriba: 10, derecha: 14, abajo: 26, izquierda: 64 };
const AREA_X = ANCHO - M.izquierda - M.derecha;
const AREA_Y = ALTO - M.arriba - M.abajo;

// Colores de las series según el tema (--serie-1 ámbar, --serie-2 gris acero; ver globals.css), comprobados con el
// validador de paletas: pasan contraste, daltonismo y separación. El gris "se lee gris" a propósito (paleta de la marca);
// la segunda serie va además en discontinua y con leyenda. Se aplican con style: var() no es fiable en atributos SVG.
export const COLOR_SERIE = { principal: "var(--serie-1)", secundaria: "var(--serie-2)" };

type Formato = (v: number) => string;

function Ejes({ marcas, min, max, formato, etiquetasX }: { marcas: number[]; min: number; max: number; formato: Formato; etiquetasX: { x: number; texto: string }[] }) {
  const y = (v: number) => M.arriba + AREA_Y - ((v - min) / (max - min || 1)) * AREA_Y;
  return (
    <g aria-hidden="true">
      {marcas.map((m) => (
        <g key={m}>
          <line x1={M.izquierda} x2={ANCHO - M.derecha} y1={y(m)} y2={y(m)} stroke="var(--linea)" strokeWidth={1} />
          <text x={M.izquierda - 8} y={y(m)} textAnchor="end" dominantBaseline="middle" fontSize={13} fill="var(--acero)">
            {formato(m)}
          </text>
        </g>
      ))}
      {etiquetasX.map((e) => (
        <text
          key={`${e.x}-${e.texto}`}
          x={e.x}
          y={ALTO - 8}
          // La etiqueta pegada al borde derecho se alinea a la derecha para que no se corte.
          textAnchor={e.x > ANCHO - M.derecha - 24 ? "end" : "middle"}
          fontSize={13}
          fill="var(--acero)"
        >
          {e.texto}
        </text>
      ))}
    </g>
  );
}

// Etiquetas del eje X: primera, del medio y última (no se amontonan en móvil).
function etiquetasDispersas(n: number, xDe: (i: number) => number, texto: (i: number) => string) {
  const indices = n <= 3 ? Array.from({ length: n }, (_, i) => i) : [0, Math.floor((n - 1) / 2), n - 1];
  return indices.map((i) => ({ x: xDe(i), texto: texto(i) }));
}

async function Figura({ titulo, resumen, children, tabla }: { titulo: string; resumen: string; children: ReactNode; tabla: ReactNode }) {
  const t = (await getT()).estadisticas;
  return (
    <figure className="mt-3 max-w-xl">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={`${titulo}. ${resumen}`} className="h-auto w-full">
        {children}
      </svg>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-bold text-azul underline">{t.verTabla}</summary>
        <div className="mt-2 max-h-72 overflow-auto rounded-md border border-linea">{tabla}</div>
      </details>
    </figure>
  );
}

function Tabla({ cabeceras, filas }: { cabeceras: string[]; filas: string[][] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-linea">
          {cabeceras.map((c) => (
            <th key={c} scope="col" className="p-2">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-linea">
        {filas.map((f, i) => (
          <tr key={i}>
            {f.map((c, j) =>
              j === 0 ? (
                <th key={j} scope="row" className="p-2 font-medium">
                  {c}
                </th>
              ) : (
                <td key={j} className="p-2 tabular-nums">
                  {c}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export async function BarChart({
  titulo,
  resumen,
  puntos,
  formato,
  formatoFecha,
  nombreValor,
}: {
  titulo: string;
  resumen: string;
  puntos: Punto[];
  formato: Formato;
  formatoFecha: (fecha: string) => string;
  nombreValor: string;
}) {
  const t = (await getT()).estadisticas;
  const { min, max, marcas } = escalaY(puntos.map((p) => p.value), { desdeCero: true });
  const hueco = 2;
  const ancho = AREA_X / Math.max(puntos.length, 1);
  const xDe = (i: number) => M.izquierda + i * ancho + ancho / 2;
  return (
    <Figura
      titulo={titulo}
      resumen={resumen}
      tabla={<Tabla cabeceras={[t.columnaSemana, nombreValor]} filas={puntos.map((p) => [formatoFecha(p.date), formato(p.value)])} />}
    >
      <Ejes marcas={marcas} min={min} max={max} formato={formato} etiquetasX={etiquetasDispersas(puntos.length, xDe, (i) => formatoFecha(puntos[i].date))} />
      {puntos.map((p, i) => {
        const h = (p.value / (max || 1)) * AREA_Y;
        return (
          <g key={p.date}>
            {/* zona de ratón más grande que la barra */}
            <rect x={M.izquierda + i * ancho} y={M.arriba} width={ancho} height={AREA_Y} fill="transparent">
              <title>{`${formatoFecha(p.date)}: ${formato(p.value)}`}</title>
            </rect>
            {p.value > 0 && (
              <rect
                x={M.izquierda + i * ancho + hueco / 2}
                y={M.arriba + AREA_Y - h}
                width={Math.max(ancho - hueco, 1)}
                height={h}
                rx={Math.min(4, (ancho - hueco) / 2)}
                style={{ fill: COLOR_SERIE.principal }}
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}
    </Figura>
  );
}

export type Serie = { nombre: string; color: string; puntos: Punto[]; discontinua?: boolean };

export async function LineChart({
  titulo,
  resumen,
  series,
  formato,
  formatoFecha,
}: {
  titulo: string;
  resumen: string;
  series: Serie[];
  formato: Formato;
  formatoFecha: (fecha: string) => string;
}) {
  const t = (await getT()).estadisticas;
  const fechas = [...new Set(series.flatMap((s) => s.puntos.map((p) => p.date)))].sort();
  const { min, max, marcas } = escalaY(series.flatMap((s) => s.puntos.map((p) => p.value)));
  const xDe = (i: number) => (fechas.length <= 1 ? M.izquierda + AREA_X / 2 : M.izquierda + (i / (fechas.length - 1)) * AREA_X);
  const indice = new Map(fechas.map((f, i) => [f, i]));
  const y = (v: number) => M.arriba + AREA_Y - ((v - min) / (max - min || 1)) * AREA_Y;

  return (
    <>
      {series.length > 1 && (
        <ul className="mt-2 flex flex-wrap gap-4 text-sm" aria-label={t.leyenda}>
          {series.map((s) => (
            <li key={s.nombre} className="flex items-center gap-2">
              <svg width="24" height="8" aria-hidden="true">
                <line x1="0" x2="24" y1="4" y2="4" style={{ stroke: s.color }} strokeWidth="2" strokeDasharray={s.discontinua ? "5 4" : undefined} />
              </svg>
              {s.nombre}
            </li>
          ))}
        </ul>
      )}
      <Figura
        titulo={titulo}
        resumen={resumen}
        tabla={
          <Tabla
            cabeceras={[t.columnaFecha, ...series.map((s) => s.nombre)]}
            filas={fechas.map((f) => [
              formatoFecha(f),
              ...series.map((s) => {
                const p = s.puntos.find((x) => x.date === f);
                return p ? formato(p.value) : "—";
              }),
            ])}
          />
        }
      >
        <Ejes marcas={marcas} min={min} max={max} formato={formato} etiquetasX={etiquetasDispersas(fechas.length, xDe, (i) => formatoFecha(fechas[i]))} />
        {series.map((s) => {
          const pts = s.puntos.map((p) => ({ x: xDe(indice.get(p.date)!), y: y(p.value), p }));
          return (
            <g key={s.nombre}>
              <polyline
                points={pts.map((q) => `${q.x},${q.y}`).join(" ")}
                fill="none"
                style={{ stroke: s.color }}
                strokeWidth={2}
                strokeDasharray={s.discontinua ? "5 4" : undefined}
                strokeLinejoin="round"
              />
              {!s.discontinua &&
                pts.map((q) => (
                  <g key={q.p.date}>
                    <circle cx={q.x} cy={q.y} r={4} style={{ fill: s.color, stroke: "var(--papel)" }} strokeWidth={2} />
                    <circle cx={q.x} cy={q.y} r={12} fill="transparent">
                      <title>{`${formatoFecha(q.p.date)}: ${formato(q.p.value)}`}</title>
                    </circle>
                  </g>
                ))}
            </g>
          );
        })}
      </Figura>
    </>
  );
}

export function StatTile({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="rounded-xl border border-linea bg-papel p-4">
      <p className="font-display text-4xl font-extrabold tabular-nums">{valor}</p>
      <p className="mt-1 text-sm text-acero">{etiqueta}</p>
    </div>
  );
}
