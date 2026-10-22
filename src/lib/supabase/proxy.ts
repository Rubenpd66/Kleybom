import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { faltanConsentimientos } from "@/lib/auth/validate";
import { COOKIE_IDIOMA, esIdioma, type Idioma } from "@/lib/i18n";
import { conIdioma, idiomaEnRuta, llevaIdioma } from "@/lib/i18n/ruta";

// Solo la zona de cuenta exige sesión. El resto (calendario, diario, entreno, estadísticas, medidas,
// crear rutina) se puede ver sin cuenta y pide entrar solo al guardar.
const RUTAS_PRIVADAS = ["/panel"];
const RUTAS_ABIERTAS = ["/panel/medidas"];
// Lo único que puede ver quien entró con Google y aún no ha aceptado los consentimientos.
const RUTAS_SIN_CONSENTIMIENTO = ["/consentimiento", "/privacidad", "/aviso-legal", "/cookies", "/api/cuenta/borrar", "/auth/"];

// Un año: la elección de idioma se recuerda en este navegador.
const UN_ANO = 60 * 60 * 24 * 365;

export async function updateSession(request: NextRequest) {
  const ruta = request.nextUrl.pathname;
  const conPrefijo = idiomaEnRuta(ruta);
  // La página tal como la conoce la app, sin el prefijo de idioma: las reglas de acceso (/panel...)
  // se aplican siempre sobre esta, para que /en/panel esté tan protegido como /panel.
  const base = conPrefijo?.resto ?? ruta;
  const cookieIdioma = request.cookies.get(COOKIE_IDIOMA)?.value;
  const guardarIdioma = (r: NextResponse, idioma: Idioma) => {
    if (cookieIdioma !== idioma) r.cookies.set(COOKIE_IDIOMA, idioma, { path: "/", maxAge: UN_ANO, sameSite: "lax" });
    return r;
  };

  // Cada idioma tiene su dirección (el español sin prefijo, el inglés con /en) para que los buscadores
  // indexen los dos. /es/... no existe como dirección propia: va a la normal.
  if (conPrefijo?.idioma === "es") {
    const url = request.nextUrl.clone();
    url.pathname = base;
    return guardarIdioma(NextResponse.redirect(url), "es");
  }
  // Quien eligió inglés y entra por una dirección sin prefijo (un favorito, un enlace) pasa a la inglesa.
  // Los buscadores no llevan la cookie, así que siempre ven la dirección sin prefijo en español.
  if (!conPrefijo && llevaIdioma(ruta) && cookieIdioma === "en") {
    const url = request.nextUrl.clone();
    url.pathname = conIdioma("en", ruta);
    return NextResponse.redirect(url);
  }

  // Las páginas viven en app/[idioma]/: el español se sirve por dentro como /es/...; /en/... ya es la ruta real.
  const idioma: Idioma = conPrefijo ? "en" : "es";
  const destino = request.nextUrl.clone();
  if (llevaIdioma(ruta) && !conPrefijo) destino.pathname = `/es${ruta === "/" ? "" : ruta}`;
  const seguir = () => (llevaIdioma(ruta) && !conPrefijo ? NextResponse.rewrite(destino, { request }) : NextResponse.next({ request }));

  let respuesta = seguir();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(lista, headers) {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = seguir();
          lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
          Object.entries(headers).forEach(([k, v]) => respuesta.headers.set(k, v));
        },
      },
    },
  );

  // No poner código entre createServerClient y getClaims: refresca la sesión.
  const { data } = await supabase.auth.getClaims();
  const privada = RUTAS_PRIVADAS.some((r) => base.startsWith(r)) && !RUTAS_ABIERTAS.some((r) => base.startsWith(r));
  if (!data?.claims && privada) {
    const url = request.nextUrl.clone();
    url.pathname = conIdioma(idioma, "/entrar");
    url.search = `?volver=${encodeURIComponent(base)}`;
    return NextResponse.redirect(url);
  }
  if (faltanConsentimientos(data?.claims) && !RUTAS_SIN_CONSENTIMIENTO.some((r) => base.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = conIdioma(idioma, "/consentimiento");
    url.search = `?volver=${encodeURIComponent(base)}`;
    return NextResponse.redirect(url);
  }
  return conPrefijo ? guardarIdioma(respuesta, "en") : respuesta;
}
