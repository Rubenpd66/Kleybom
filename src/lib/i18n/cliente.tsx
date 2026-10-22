"use client";

import { createContext, useContext } from "react";
import { diccionario, type Idioma } from "./index";

// El layout raíz pone aquí el idioma de la página; los componentes de cliente leen el diccionario con useT().
const IdiomaContext = createContext<Idioma>("es");

export function IdiomaProvider({ idioma, children }: { idioma: Idioma; children: React.ReactNode }) {
  return <IdiomaContext.Provider value={idioma}>{children}</IdiomaContext.Provider>;
}

export function useIdioma(): Idioma {
  return useContext(IdiomaContext);
}

export function useT() {
  return diccionario(useIdioma());
}
