// Donaciones voluntarias con un enlace de pago de Stripe (Payment Link). Sin cuenta de Stripe no hay
// enlace y no se muestra nada: la web funciona igual. El enlace se pone en NEXT_PUBLIC_DONACIONES_URL.
// Solo se aceptan direcciones HTTPS de Stripe: un valor mal copiado no puede llevar a otra web.
const DOMINIOS_STRIPE = ["buy.stripe.com", "donate.stripe.com"];

export function enlaceDonaciones(valor: string | undefined): string | null {
  if (!valor) return null;
  try {
    const u = new URL(valor.trim());
    return u.protocol === "https:" && DOMINIOS_STRIPE.includes(u.hostname) && !u.username && !u.password ? u.toString() : null;
  } catch {
    return null;
  }
}

export const ENLACE_DONACIONES = enlaceDonaciones(process.env.NEXT_PUBLIC_DONACIONES_URL);
