"use client";

import { es } from "@/lib/i18n/es";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print h-10 rounded-md border-[1.5px] border-hierro px-4 text-sm font-bold"
    >
      {es.rutinas.imprimir}
    </button>
  );
}
