const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_CONTRASENA = 8;

// Devuelve el texto del error, o null si todo está bien.
export function validarCredenciales(correo: string, contrasena: string): string | null {
  if (!CORREO.test(correo.trim())) return "Escribe un correo válido, por ejemplo nombre@correo.es.";
  if (contrasena.length < MIN_CONTRASENA)
    return `La contraseña necesita al menos ${MIN_CONTRASENA} caracteres.`;
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
export const VERSION_PRIVACIDAD = "2026-10-21";

// Registro: hace falta aceptar la privacidad (con 14 años o más, art. 7 LOPDGDD) y dar el
// consentimiento explícito para los datos de salud (art. 9.2.a RGPD).
export function validarConsentimientos(privacidad: boolean, salud: boolean): string | null {
  if (!privacidad) return "Para crear la cuenta tienes que aceptar la política de privacidad y tener 14 años o más.";
  if (!salud) return "Para crear la cuenta tienes que aceptar que KleyBom guarde los datos de salud que apuntes.";
  return null;
}

const ERRORES: Record<string, string> = {
  invalid_credentials: "El correo o la contraseña no son correctos. Revísalos e inténtalo de nuevo.",
  email_not_confirmed: "Aún no has confirmado tu correo. Abre el mensaje que te enviamos y pulsa el enlace.",
  user_already_exists: "Ya existe una cuenta con ese correo. Prueba a entrar con ella.",
  weak_password: "Esa contraseña es demasiado fácil de adivinar. Prueba con otra más larga o variada.",
  over_email_send_rate_limit: "Se han enviado demasiados correos seguidos. Espera unos minutos e inténtalo de nuevo.",
  over_request_rate_limit: "Demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.",
};

export function mensajeDeError(codigo: string | undefined): string {
  return (codigo && ERRORES[codigo]) || "Algo ha fallado. Inténtalo de nuevo en unos minutos.";
}
