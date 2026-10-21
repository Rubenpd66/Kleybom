import { es } from "@/lib/i18n/es";

// Atribución que exigen las licencias Creative Commons: autor, licencia (con enlace) y origen.
export default function CreditoFoto({
  autor,
  licencia,
  licenciaUrl,
  fuente,
}: {
  autor: string;
  licencia: string;
  licenciaUrl: string | null;
  fuente: string;
}) {
  return (
    <p>
      {es.ficha.foto}: {autor} ·{" "}
      {licenciaUrl ? (
        <a href={licenciaUrl} className="text-azul underline" rel="noopener noreferrer">
          {licencia}
        </a>
      ) : (
        licencia
      )}{" "}
      ·{" "}
      <a href={fuente} className="text-azul underline" rel="noopener noreferrer">
        Wikimedia Commons
      </a>
    </p>
  );
}
