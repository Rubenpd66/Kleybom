import type { NextConfig } from "next";

// Cabeceras de seguridad para toda la web. Son conservadoras: protegen sin bloquear lo que ya se usa
// (fuentes propias, Supabase, el fondo 3D, el lector de código de barras con la cámara).
// - frame-ancestors/X-Frame-Options: nadie puede meter la web dentro de un iframe (evita el "clickjacking").
// - object-src 'none' y base-uri 'self': cierran dos vías de inyección clásicas.
// - nosniff: el navegador respeta el tipo de archivo que enviamos.
// - Referrer-Policy: al salir a otra web no se filtra la dirección completa.
// - HSTS: una vez visitada por HTTPS, el navegador no vuelve a probar por HTTP.
// - Permissions-Policy: se desactivan cámara/micro/ubicación salvo la cámara en nuestra propia web
//   (la necesita /alimentos/codigo). Al añadir anuncios o analítica habrá que ampliar la CSP.
const CABECERAS_SEGURIDAD = [
  { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [{ source: "/:path*", headers: CABECERAS_SEGURIDAD }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
