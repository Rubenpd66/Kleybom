import Anuncio from "@/components/ui/Anuncio";
import Link from "@/components/ui/Link";
import type { ExerciseDetail as Ficha } from "@/lib/exercises/queries";
import { getT } from "@/lib/i18n/servidor";
import ExerciseImage from "./ExerciseImage";


const URL_LICENCIA: Record<string, string> = {
  "CC-BY-SA 3": "https://creativecommons.org/licenses/by-sa/3.0/deed.es",
  "CC-BY-SA 4": "https://creativecommons.org/licenses/by-sa/4.0/deed.es",
  "CC-BY 4": "https://creativecommons.org/licenses/by/4.0/deed.es",
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/deed.es",
};

function Lista({ titulo, items, ordenada }: { titulo: string; items: string[]; ordenada?: boolean }) {
  if (items.length === 0) return null;
  const Etiqueta = ordenada ? "ol" : "ul";
  return (
    <section className="mt-10">
      <h2 className="font-display text-[1.7rem] font-bold">{titulo}</h2>
      <Etiqueta
        className={`mt-3 flex max-w-[62ch] flex-col gap-3 pl-6 ${ordenada ? "list-decimal" : "list-disc"}`}
      >
        {items.map((paso, i) => (
          <li key={i}>{paso}</li>
        ))}
      </Etiqueta>
    </section>
  );
}

export default async function ExerciseDetail({ ejercicio: e }: { ejercicio: Ficha }) {
  const es = await getT();
  const t = es.ficha;
  const principales = e.muscles.filter((m) => m.role === "principal");
  const secundarios = e.muscles.filter((m) => m.role === "secundario");
  const urlLicencia = e.license ? URL_LICENCIA[e.license] : undefined;

  return (
    <article>
      <Link href="/ejercicios" className="text-sm font-bold text-azul underline">
        {t.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {e.name_es}
      </h1>
      <p className="mt-4 w-fit rounded-full border border-hierro px-3 py-0.5 text-sm">
        {es.ejercicios.niveles[e.level]}
      </p>

      {e.needs_translation && (
        <p className="mt-4 max-w-[62ch] rounded-md border border-linea bg-papel p-3 text-sm">
          {t.enIngles}
        </p>
      )}

      <div className="mt-8 max-w-md">
        <ExerciseImage
          src={e.image_url}
          alt={e.image_url ? e.name_es : t.dibujoMusculos(e.name_es)}
          musculos={e.muscles}
          sizes="(min-width: 640px) 448px, 90vw"
          prioridad
        />
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {principales.length > 0 && (
          <section>
            <h2 className="text-sm font-bold">{t.musculosPrincipales}</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {principales.map((m) => (
                <li key={m.slug} className="rounded-full bg-temple px-3 py-1 text-sm font-medium text-tinta">
                  {m.name_es}
                </li>
              ))}
            </ul>
          </section>
        )}
        {secundarios.length > 0 && (
          <section>
            <h2 className="text-sm font-bold">{t.musculosSecundarios}</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {secundarios.map((m) => (
                <li key={m.slug} className="rounded-full border border-hierro px-3 py-1 text-sm">
                  {m.name_es}
                </li>
              ))}
            </ul>
          </section>
        )}
        {e.equipment.length > 0 && (
          <section>
            <h2 className="text-sm font-bold">{t.material}</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {e.equipment.map((m) => (
                <li key={m.slug} className="rounded-full border border-linea bg-papel px-3 py-1 text-sm">
                  {m.name_es}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {e.instructions_es.length > 0 ? (
        <Lista titulo={t.pasos} items={e.instructions_es} ordenada />
      ) : (
        e.description_es && (
          <section className="mt-10">
            <h2 className="font-display text-[1.7rem] font-bold">{t.pasos}</h2>
            <p className="mt-3 max-w-[62ch]">{e.description_es}</p>
          </section>
        )
      )}
      <Lista titulo={t.consejos} items={e.tips_es} />
      <Lista titulo={t.errores} items={e.common_mistakes_es} />

      <footer className="mt-12 border-t border-linea pt-4 text-sm text-acero">
        {e.author && (
          <p>
            {t.atribucion}: {e.author}
          </p>
        )}
        {e.license && (
          <p>
            {t.licencia}:{" "}
            {urlLicencia ? (
              <a href={urlLicencia} className="text-azul underline" rel="noopener noreferrer">
                {e.license}
              </a>
            ) : (
              e.license
            )}
          </p>
        )}
        {e.source && (
          <p>
            {t.fuente}: {e.source}
          </p>
        )}
        {e.image_url && e.image_author && (
          <p>
            {t.foto}: {e.image_author} ·{" "}
            {e.image_license && URL_LICENCIA[e.image_license] ? (
              <a href={URL_LICENCIA[e.image_license]} className="text-azul underline" rel="noopener noreferrer">
                {e.image_license}
              </a>
            ) : (
              e.image_license
            )}{" "}
            · wger.de
          </p>
        )}
      </footer>
      <Anuncio />
    </article>
  );
}
