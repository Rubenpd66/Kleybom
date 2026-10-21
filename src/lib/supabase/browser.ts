import { createBrowserClient as crear } from "@supabase/ssr";

export function createBrowserClient() {
  return crear(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
