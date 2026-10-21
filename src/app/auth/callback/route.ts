import { NextResponse, type NextRequest } from "next/server";
import { rutaDeVuelta } from "@/lib/auth/validate";
import { createServerClient } from "@/lib/supabase/server";

// Destino del enlace del correo de confirmación.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(rutaDeVuelta(request.nextUrl.searchParams.get("volver")), request.url));
  }
  return NextResponse.redirect(new URL("/entrar", request.url));
}
