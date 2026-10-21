const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_CONTRASENA = 8;

// Devuelve el texto del error, o null si todo está bien.
export function validarCredenciales(correo: string, contrasena: string): string | null {
  if (!CORREO.test(correo.trim())) return "Escribe un correo válido, por ejemplo nombre@correo.es.";
  if (contrasena.length < MIN_CONTRASENA)
    return `La contraseña necesita al menos ${MIN_CONTRASENA} caracteres.`;
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
