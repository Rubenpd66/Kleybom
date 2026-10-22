"use server";

import { idiomaDeCookie } from "@/lib/i18n/servidor";
import { buscarEnTodo } from "@/lib/search/global";
import type { Resultados } from "@/lib/search/tipos";

// Resultados rápidos para el desplegable de la cabecera (pocos por grupo).
export async function buscarRapido(texto: string): Promise<Resultados> {
  return buscarEnTodo(String(texto ?? ""), await idiomaDeCookie(), 4);
}
