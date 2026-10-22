import Link from "@/components/ui/Link";
import AjustesPrivacidad from "@/components/ui/AjustesPrivacidad";
import { ANUNCIOS_ACTIVOS } from "@/lib/anuncios";
import { ENLACE_DONACIONES } from "@/lib/donaciones";
import { getT } from "@/lib/i18n/servidor";

// Pie en una sola franja: aviso de salud (obligatorio) a un lado y enlaces al otro.
export default async function Footer() {
  const es = await getT();
  return (
    <footer className="mt-auto border-t border-linea bg-papel/80 backdrop-blur-sm">
      <div className="mx-auto flex lg:px-10 2xl:px-16 flex-col gap-3 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-acero">{es.footer.aviso}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {[...(ENLACE_DONACIONES ? [{ href: "/apoya", label: es.footer.apoyar }] : []), ...es.footer.enlaces].map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="hover:text-temple-osc hover:underline">
                {e.label}
              </Link>
            </li>
          ))}
          {ANUNCIOS_ACTIVOS && (
            <li>
              <AjustesPrivacidad etiqueta={es.footer.ajustesPrivacidad} />
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
