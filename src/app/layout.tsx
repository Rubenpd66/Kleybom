import type { Metadata } from "next";
import { Big_Shoulders, Schibsted_Grotesk } from "next/font/google";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Fondo3D from "@/components/fondo/Fondo3D";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { SCRIPT_TEMA } from "@/lib/tema";
import { es } from "@/lib/i18n/es";
import { IMAGEN_COMPARTIR, SITE_URL } from "@/lib/seo/site";
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
  metadataBase: new URL(SITE_URL),
  title: es.meta.titulo,
  description: es.meta.descripcion,
  openGraph: {
    siteName: es.marca,
    locale: "es_ES",
    type: "website",
    images: [IMAGEN_COMPARTIR],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: el script del tema puede poner data-tema en <html> antes de que cargue React.
    <html lang="es" className={`${titulos.variable} ${texto.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-temple focus:p-3 focus:text-tinta"
        >
          {es.nav.saltarAlContenido}
        </a>
        <Suspense fallback={null}>
          <Fondo3D />
        </Suspense>
        <Header />
        {/* Como mínimo una pantalla: el pie empieza fuera de la vista y no salta al llegar el contenido (CLS). */}
        <div id="contenido" className="flex min-h-screen flex-1 flex-col">
          {children}
        </div>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
