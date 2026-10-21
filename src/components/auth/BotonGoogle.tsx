import { conGoogle } from "@/app/(auth)/actions";
import { es } from "@/lib/i18n/es";

// Formulario aparte (no puede ir dentro del de correo): lleva a Google y vuelve a /auth/callback.
export default function BotonGoogle({ volver }: { volver: string }) {
  return (
    <form action={conGoogle} className="flex flex-col gap-4">
      <input type="hidden" name="volver" value={volver} />
      <button
        type="submit"
        className="flex h-11 items-center justify-center gap-3 rounded-md border-[1.5px] border-hierro bg-papel px-6 font-bold hover:border-temple"
      >
        {/* Logotipo "G" de Google, con sus colores, como piden sus normas de marca. */}
        <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5Z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5Z" />
        </svg>
        {es.auth.conGoogle}
      </button>
      <p className="flex items-center gap-3 text-sm text-acero before:h-px before:flex-1 before:bg-linea after:h-px after:flex-1 after:bg-linea">
        {es.auth.o}
      </p>
    </form>
  );
}
