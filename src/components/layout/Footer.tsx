import Link from "next/link";
import { es } from "@/lib/i18n/es";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-linea bg-papel">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-6 py-8">
        <p className="max-w-[62ch] text-sm text-acero">{es.footer.aviso}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {es.footer.enlaces.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="hover:underline">
                {e.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
