"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useIdioma } from "@/lib/i18n/cliente";
import { conIdioma } from "@/lib/i18n/ruta";

// Como el Link de Next, pero en la versión inglesa los enlaces internos llevan /en (cada idioma
// tiene su dirección). Se usa en toda la web en lugar de importar Link de "next/link".
export default function Link({ href, ...resto }: ComponentProps<typeof NextLink>) {
  const idioma = useIdioma();
  return <NextLink href={typeof href === "string" ? conIdioma(idioma, href) : href} {...resto} />;
}
