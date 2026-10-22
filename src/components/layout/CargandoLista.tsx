import { getT } from "@/lib/i18n/servidor";

// Marcador mientras llega un listado largo. Ocupa una pantalla para que lo que va debajo
// no salte cuando aparece el contenido (CLS). Solo para páginas cuyo contenido es más alto que la pantalla.
export default async function CargandoLista() {
  const es = await getT();
  return (
    <p role="status" className="mt-8 min-h-screen text-acero">
      {es.ejercicios.cargando}
    </p>
  );
}
