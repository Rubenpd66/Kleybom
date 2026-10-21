import { es } from "@/lib/i18n/es";

// Marcador mientras llega un listado largo. Ocupa una pantalla para que el pie ya quede abajo
// y no salte cuando aparece el contenido (CLS). Solo para páginas cuyo contenido es más alto que la pantalla.
export default function CargandoLista() {
  return (
    <p role="status" className="mt-8 min-h-screen text-acero">
      {es.ejercicios.cargando}
    </p>
  );
}
