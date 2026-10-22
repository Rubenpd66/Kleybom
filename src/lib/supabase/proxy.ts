import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { faltanConsentimientos } from "@/lib/auth/validate";
import { COOKIE_IDIOMA, esIdioma } from "@/lib/i18n";
import { idiomaEnRuta, llevaIdioma } from "@/lib/i18n/ruta";

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

  // /en/... o /es/...: se guarda ese idioma y se va a la dirección de siempre (sin prefijo).
  const conPrefijo = idiomaEnRuta(ruta);
  if (conPrefijo) {
    const url = request.nextUrl.clone();
    url.pathname = conPrefijo.resto;
    const r = NextResponse.redirect(url);
    r.cookies.set(COOKIE_IDIOMA, conPrefijo.idioma, { path: "/", maxAge: UN_ANO, sameSite: "lax" });
    return r;
  }

  // Las páginas viven en app/[idioma]/: por dentro se sirve /es/... o /en/... según la cookie.
  const elegido = request.cookies.get(COOKIE_IDIOMA)?.value;
  const idioma = esIdioma(elegido) ? elegido : "es";
  const destino = request.nextUrl.clone();
  if (llevaIdioma(ruta)) destino.pathname = `/${idioma}${ruta === "/" ? "" : ruta}`;
  const seguir = () => (llevaIdioma(ruta) ? NextResponse.rewrite(destino, { request }) : NextResponse.next({ request }));

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
  const privada = RUTAS_PRIVADAS.some((r) => ruta.startsWith(r)) && !RUTAS_ABIERTAS.some((r) => ruta.startsWith(r));
  if (!data?.claims && privada) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?volver=${encodeURIComponent(ruta)}`;
    return NextResponse.redirect(url);
  }
  if (faltanConsentimientos(data?.claims) && !RUTAS_SIN_CONSENTIMIENTO.some((r) => ruta.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = "/consentimiento";
    url.search = `?volver=${encodeURIComponent(ruta)}`;
    return NextResponse.redirect(url);
  }
  return respuesta;
}
