import Link from "next/link";
import { es } from "@/lib/i18n/es";

// Pie en una sola franja: aviso de salud (obligatorio) a un lado y enlaces al otro.
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-linea bg-papel/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-acero">{es.footer.aviso}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {es.footer.enlaces.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="hover:text-temple-osc hover:underline">
                {e.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
