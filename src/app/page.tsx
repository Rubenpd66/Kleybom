import type { Metadata } from "next";
import Link from "next/link";
import CalorieBar from "@/components/foods/CalorieBar";
import NutritionTable from "@/components/foods/NutritionTable";
import FotoEntreno from "@/components/home/FotoEntreno";
import MuscleSelector from "@/components/home/MuscleSelector";
import { COLOR_SERIE, LineChart } from "@/components/stats/Charts";
import { getHomeData } from "@/lib/home/queries";
import { es } from "@/lib/i18n/es";
import { jsonLd, websiteLd } from "@/lib/seo/site";

const t = es.inicio;

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Serie inventada para el gráfico de ejemplo (8 semanas).
const EJEMPLO = [60, 61.5, 61, 64, 65.5, 65, 69, 72].map((value, i) => ({ date: `2026-0${1 + Math.floor(i / 4)}-${String(1 + (i % 4) * 7).padStart(2, "0")}`, value }));
const semana = (fecha: string) => `Sem. ${EJEMPLO.findIndex((p) => p.date === fecha) + 1}`;
const kg = (v: number) => `${v.toLocaleString("es-ES")} kg`;

function Seccion({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-t border-linea">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">{children}</div>
    </section>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[0.95]">{children}</h2>;
}

export default async function Home() {
  const { grupos, ejemplo, alimento } = await getHomeData();
  const principales = ejemplo?.muscles.filter((m) => m.role === "principal") ?? [];
  const secundarios = ejemplo?.muscles.filter((m) => m.role === "secundario") ?? [];

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd()) }} />

      <div className="mx-auto grid max-w-[1180px] items-start gap-10 px-6 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
        <div>
          <h1 className="font-display text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[0.92]">{t.titular}</h1>
          <p className="mt-6 max-w-[56ch] text-lg text-acero">{t.entradilla}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ejercicios" className="rounded-md bg-hierro px-5 py-3 font-bold text-tiza">
              {t.explorar}
            </Link>
            <Link href="/registro" className="rounded-md border-[1.5px] border-hierro px-5 py-3 font-bold">
              {t.crearCuenta}
            </Link>
          </div>
          <p className="mt-4 text-[0.95rem] text-acero">{t.nota}</p>
          <div aria-hidden="true" className="barra-temple mt-10 h-2.5 rounded-sm" />
        </div>
        <MuscleSelector grupos={grupos} />
      </div>
      <FotoEntreno />

      <Seccion>
        <div>
          <Titulo>{t.fichaTitulo}</Titulo>
          <p className="mt-4 max-w-[56ch] text-acero">{t.fichaTexto}</p>
          <dl className="mt-8 divide-y divide-linea border-y border-hierro">
            {t.funciones.map((f) => (
              <div key={f.titulo} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="font-display text-2xl font-bold">
                  <Link href={f.href} className="hover:underline">
                    {f.titulo}
                  </Link>
                </dt>
                <dd className="text-acero">{f.texto}</dd>
              </div>
            ))}
          </dl>
        </div>
        {ejemplo && (
          <article aria-labelledby="ficha-ejemplo" className="rounded-xl border-[1.5px] border-hierro bg-papel p-5 sm:p-6">
            <h3 id="ficha-ejemplo" className="font-display text-3xl font-bold leading-tight">
              {ejemplo.name_es}
            </h3>
            <ul aria-label="Músculos" className="mt-3 flex flex-wrap gap-2 text-sm">
              {principales.map((m) => (
                <li key={m.slug} className="rounded-full border border-temple-osc bg-temple px-3 py-0.5">
                  {m.name_es}
                </li>
              ))}
              {secundarios.map((m) => (
                <li key={m.slug} className="rounded-full border border-hierro px-3 py-0.5">
                  {m.name_es}
                </li>
              ))}
            </ul>
            <ol className="mt-5 flex list-decimal flex-col gap-2 pl-6">
              {ejemplo.instructions_es.slice(0, 3).map((paso) => (
                <li key={paso}>{paso}</li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-acero">{t.fichaFuente(ejemplo.author ?? "wger", ejemplo.license ?? "CC-BY-SA")}</p>
            <Link href={`/ejercicios/${ejemplo.slug}`} className="mt-3 inline-block font-bold text-azul underline">
              {t.fichaVer}
            </Link>
          </article>
        )}
      </Seccion>

      <Seccion>
        {alimento && (
          <div className="order-2 rounded-xl border-[1.5px] border-hierro bg-papel p-5 md:order-1 [&_table]:mt-0">
            <NutritionTable nutrientes={alimento} titulo={t.alimentoTabla(alimento.name_es)} />
            <div className="mt-5">
              <CalorieBar protein_g={alimento.protein_g} carbs_g={alimento.carbs_g} fat_g={alimento.fat_g} />
            </div>
          </div>
        )}
        <div className="order-1 md:order-2">
          <Titulo>{t.alimentosTitulo}</Titulo>
          <p className="mt-4 max-w-[56ch] text-acero">{t.alimentosTexto}</p>
          <Link href="/alimentos" className="mt-6 inline-block font-bold text-azul underline">
            {t.alimentosVer}
          </Link>
        </div>
      </Seccion>

      <Seccion>
        <div>
          <Titulo>{t.progresoTitulo}</Titulo>
          <p className="mt-4 max-w-[56ch] text-acero">{t.progresoTexto}</p>
        </div>
        <div className="rounded-xl border-[1.5px] border-hierro bg-papel p-5">
          <h3 className="font-bold">{t.progresoGrafico}</h3>
          <LineChart
            titulo={t.progresoGrafico}
            resumen={t.progresoResumen}
            series={[{ nombre: "1RM estimado", color: COLOR_SERIE.principal, puntos: EJEMPLO }]}
            formato={kg}
            formatoFecha={semana}
          />
          <p className="mt-2 text-sm text-acero">{t.progresoNota}</p>
        </div>
      </Seccion>

      <section className="bg-hierro text-tiza">
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:py-24">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[0.95]">{t.gratisTitulo}</h2>
          <p className="mt-4 max-w-[56ch] text-[#d5dbe0]">{t.gratisTexto}</p>
        </div>
      </section>
    </main>
  );
}
