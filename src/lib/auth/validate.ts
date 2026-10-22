import { es, type Diccionario } from "@/lib/i18n/es";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_CONTRASENA = 8;

// Devuelve el texto del error, o null si todo está bien.
// `t`: los mensajes en el idioma de la página (por defecto, español).
type Errores = Diccionario["auth"]["errores"];

export function validarCredenciales(correo: string, contrasena: string, t: Errores = es.auth.errores): string | null {
  if (!CORREO.test(correo.trim())) return t.correo;
  if (contrasena.length < MIN_CONTRASENA) return t.contrasena(MIN_CONTRASENA);
  return null;
}

// Página a la que volver tras entrar. Solo rutas internas ("/algo"): nunca otra web
// ("//otra.com", "/\otra.com") para que el enlace no sirva para redirigir a un sitio falso.
export function rutaDeVuelta(valor: unknown): string {
  const v = typeof valor === "string" ? valor.trim() : "";
  if (!v.startsWith("/") || v.startsWith("//") || v.includes("\\") || v.length > 200) return "/panel";
  return v;
}

// Versión de la política de privacidad que acepta quien se registra (fecha de la última revisión).
export const VERSION_PRIVACIDAD = "2026-10-22";

// Registro: hace falta aceptar la privacidad (con 14 años o más, art. 7 LOPDGDD) y dar el
// consentimiento explícito para los datos de salud (art. 9.2.a RGPD).
export function validarConsentimientos(privacidad: boolean, salud: boolean, t: Errores = es.auth.errores): string | null {
  if (!privacidad) return t.privacidad;
  if (!salud) return t.salud;
  return null;
}

// Quien entra con Google no pasa por el formulario de registro: hasta que acepte los
// consentimientos, solo puede ver la página que los pide (o las de privacidad).
export function faltanConsentimientos(claims: { user_metadata?: unknown; app_metadata?: unknown } | undefined): boolean {
  if (!claims) return false;
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const app = (claims.app_metadata ?? {}) as Record<string, unknown>;
  // Las cuentas con correo ya aceptaron al registrarse (o las creó el administrador, como las de prueba).
  const proveedores = Array.isArray(app.providers) ? app.providers : [];
  return proveedores.length > 0 && !proveedores.includes("email") && !meta.privacidad_aceptada;
}

export function mensajeDeError(codigo: string | undefined, t: Errores = es.auth.errores): string {
  return (codigo && t.supabase[codigo]) || t.general;
}
