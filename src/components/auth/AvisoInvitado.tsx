import Link from "next/link";
import { getT } from "@/lib/i18n/servidor";

// Aviso corto para quien usa una sección personal sin cuenta: puede probarla, pero no se guarda nada.
// `ruta` es la página actual: tras entrar o registrarse se vuelve a ella.
export default async function AvisoInvitado({ ruta }: { ruta: string }) {
  const t = (await getT()).invitado;
  const volver = `?volver=${encodeURIComponent(ruta)}`;
  return (
    <aside
      aria-label={t.etiqueta}
      className="mt-6 flex w-fit flex-wrap items-center gap-x-4 gap-y-2 rounded-full border border-linea bg-papel/80 px-4 py-2 text-sm backdrop-blur-sm"
    >
      <span>{t.texto}</span>
      <Link href={`/entrar${volver}`} className="font-bold text-azul underline">
        {t.entrar}
      </Link>
      <Link href={`/registro${volver}`} className="font-bold text-azul underline">
        {t.registro}
      </Link>
    </aside>
  );
}
