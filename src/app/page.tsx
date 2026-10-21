import { es } from "@/lib/i18n/es";
import { jsonLd, websiteLd } from "@/lib/seo/site";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd()) }} />
      <h1 className="font-display text-[clamp(3.2rem,9vw,6.6rem)] font-extrabold leading-none">
        {es.marca}
      </h1>
      <p className="mt-4 max-w-[62ch] text-acero">{es.meta.descripcion}</p>
    </main>
  );
}
