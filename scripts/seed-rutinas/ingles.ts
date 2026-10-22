// Añade el inglés a las rutinas plantilla ya cargadas, sin tocar sus ejercicios (los entrenos
// guardados siguen apuntando a las mismas filas).
// Uso: node scripts/seed-rutinas/ingles.ts   (necesita SUPABASE_SERVICE_ROLE_KEY en .env.local)
import { createClient } from "@supabase/supabase-js";
import { PLANTILLAS } from "./rutinas.ts";
import { NOTAS_EN, RUTINAS_EN } from "./rutinas-en.ts";

process.loadEnvFile(".env.local");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

for (const p of PLANTILLAS) {
  const en = RUTINAS_EN[p.slug];
  if (!en) throw new Error(`Falta el inglés de ${p.slug}`);
  const { data: rutina, error } = await db
    .from("routines")
    .update({ name_en: en.name, description_en: en.description })
    .eq("slug", p.slug)
    .is("owner_id", null)
    .select("id")
    .single();
  if (error) throw new Error(`${p.slug}: ${error.message}`);

  const { data: filas, error: e2 } = await db.from("routine_exercises").select("id, notes").eq("routine_id", rutina.id).not("notes", "is", null);
  if (e2) throw new Error(e2.message);
  for (const f of filas ?? []) {
    const nota = NOTAS_EN[f.notes as string];
    if (!nota) throw new Error(`Falta la traducción de la nota: ${f.notes}`);
    const { error: e3 } = await db.from("routine_exercises").update({ notes_en: nota }).eq("id", f.id);
    if (e3) throw new Error(e3.message);
  }
  console.log(`${p.slug}: ${filas?.length ?? 0} notas`);
}
