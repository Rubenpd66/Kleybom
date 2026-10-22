import type { Metadata } from "next";
import { Big_Shoulders, Schibsted_Grotesk } from "next/font/google";
import { Suspense } from "react";
import Fondo3D from "@/components/fondo/Fondo3D";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { ID_ADSENSE } from "@/lib/anuncios";
import { IDIOMAS } from "@/lib/i18n";
import { IdiomaProvider } from "@/lib/i18n/cliente";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { SCRIPT_TEMA } from "@/lib/tema";
import { IMAGEN_COMPARTIR, SITE_URL } from "@/lib/seo/site";
import "../globals.css";

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

// Las dos versiones se generan al compilar; el proxy elige cuál servir según la cookie de idioma.
export function generateStaticParams() {
  return IDIOMAS.map((idioma) => ({ idioma }));
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, idioma] = await Promise.all([getT(), getIdioma()]);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.titulo,
    description: t.meta.descripcion,
    openGraph: {
      siteName: t.marca,
      locale: idioma === "en" ? "en_GB" : "es_ES",
      type: "website",
      images: [IMAGEN_COMPARTIR],
    },
    twitter: { card: "summary_large_image" },
    // Verificación de la web en AdSense sin cargar ningún script (solo con NEXT_PUBLIC_ADSENSE_ID).
    ...(ID_ADSENSE && { other: { "google-adsense-account": ID_ADSENSE } }),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[idioma]">) {
  const [t, idioma] = await Promise.all([getT(), getIdioma()]);
  return (
    // suppressHydrationWarning: el script del tema puede poner data-tema en <html> antes de que cargue React.
    <html lang={idioma} className={`${titulos.variable} ${texto.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="flex min-h-full flex-col">
        <IdiomaProvider idioma={idioma}>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-temple focus:p-3 focus:text-tinta"
          >
            {t.nav.saltarAlContenido}
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
        </IdiomaProvider>
      </body>
    </html>
  );
}
