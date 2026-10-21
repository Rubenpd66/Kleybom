import type { Seccion } from "@/lib/guides/content";

// Secciones de texto (párrafos y listas) de las guías y de las páginas legales.
export default function Secciones({ secciones }: { secciones: Seccion[] }) {
  return secciones.map((s) => (
    <section key={s.titulo} className="mt-10">
      <h2 className="font-display text-[1.7rem] font-bold">{s.titulo}</h2>
      <div className="mt-3 flex max-w-[62ch] flex-col gap-3">
        {s.bloques.map((b, i) =>
          b.tipo === "p" ? (
            <p key={i}>{b.texto}</p>
          ) : (
            <ul key={i} className="flex list-disc flex-col gap-2 pl-6">
              {b.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ),
        )}
      </div>
    </section>
  ));
}
