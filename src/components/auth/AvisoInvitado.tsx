import Link from "next/link";
import { es } from "@/lib/i18n/es";

const t = es.invitado;

// Aviso para quien visita una sección personal sin cuenta: puede probarla, pero no se guarda nada.
// `ruta` es la página actual: tras entrar o registrarse se vuelve a ella.
export default function AvisoInvitado({ ruta, que }: { ruta: string; que: string }) {
  const volver = `?volver=${encodeURIComponent(ruta)}`;
  return (
    <aside aria-label={t.etiqueta} className="mt-6 max-w-[70ch] rounded-xl border-[1.5px] border-azul bg-papel p-4">
      <p>
        {t.texto(que)}{" "}
        <Link href={`/entrar${volver}`} className="font-bold text-azul underline">
          {t.entrar}
        </Link>{" "}
        {t.o}{" "}
        <Link href={`/registro${volver}`} className="font-bold text-azul underline">
          {t.registro}
        </Link>
        .
      </p>
    </aside>
  );
}
