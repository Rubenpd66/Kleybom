import { getImageProps } from "next/image";

// Foto de la portada (generada con Nano Banana, ver docs/estilo-imagenes.md):
// horizontal en escritorio y vertical recortada en móvil.
const ALT =
  "Un hombre se ata las zapatillas sentado en un banco de un gimnasio amplio y luminoso; a su lado, una tableta muestra estadísticas de entrenamiento.";

export default function FotoEntreno() {
  const comun = { alt: ALT, sizes: "(min-width: 1180px) 1132px, 100vw" };
  const {
    props: { srcSet: escritorio },
  } = getImageProps({ ...comun, src: "/img/entreno-horizontal.webp", width: 1024, height: 572 });
  const {
    props: { srcSet: movil, ...resto },
  } = getImageProps({ ...comun, src: "/img/entreno-vertical.webp", width: 572, height: 1024 });

  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-16">
      <picture>
        <source media="(min-width: 768px)" srcSet={escritorio} />
        <source srcSet={movil} />
        <img {...resto} alt={ALT} className="aspect-[4/5] w-full rounded-xl object-cover md:aspect-[1024/572]" />
      </picture>
    </div>
  );
}
