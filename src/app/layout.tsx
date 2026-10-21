import type { Metadata } from "next";
import { Big_Shoulders, Schibsted_Grotesk } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { es } from "@/lib/i18n/es";
import "./globals.css";

const titulos = Big_Shoulders({
  variable: "--font-titulos",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const texto = Schibsted_Grotesk({
  variable: "--font-texto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: es.meta.titulo,
  description: es.meta.descripcion,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${titulos.variable} ${texto.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-temple focus:p-3"
        >
          {es.nav.saltarAlContenido}
        </a>
        <Header />
        <div id="contenido" className="flex flex-1 flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
