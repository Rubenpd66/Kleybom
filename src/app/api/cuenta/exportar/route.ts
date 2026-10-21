import { getCurrentUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

// Descarga de todos los datos del usuario (derecho de portabilidad del RGPD, art. 20).
// Se usa el cliente con la sesión del usuario: las políticas de la base solo devuelven lo suyo,
// y además se filtra por su id.
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return Response.json({ error: "Sin sesión" }, { status: 401 });

  const db = await createServerClient();
  const id = usuario.id;
  const [perfil, objetivos, rutinas, calendario, diario, entrenos, medidas] = await Promise.all([
    db.from("profiles").select("display_name, sex, birth_date, height_cm, timezone, created_at").eq("id", id).maybeSingle(),
    db.from("nutrition_goals").select("kcal, protein_g, carbs_g, fat_g, updated_at").eq("user_id", id).maybeSingle(),
    db
      .from("routines")
      .select("name, description, goal, level, days_per_week, created_at, routine_exercises(day_index, position, sets, reps_min, reps_max, rest_seconds, notes, exercises(name_es))")
      .eq("owner_id", id)
      .order("id"),
    db.from("planned_sessions").select("date, status, note, routine_day_index, routines(name)").eq("user_id", id).order("date"),
    db.from("meal_entries").select("date, meal, grams, foods(name_es)").eq("user_id", id).order("date"),
    db
      .from("workout_logs")
      .select("date, started_at, finished_at, note, routine_day_index, routines(name), set_logs(set_index, weight_kg, reps, rpe, exercises(name_es))")
      .eq("user_id", id)
      .order("started_at"),
    db.from("body_measurements").select("date, weight_kg, waist_cm, hip_cm, chest_cm").eq("user_id", id).order("date"),
  ]);

  const errores = [perfil, objetivos, rutinas, calendario, diario, entrenos, medidas].filter((r) => r.error);
  if (errores.length) return Response.json({ error: "No se han podido reunir los datos. Inténtalo más tarde." }, { status: 500 });

  const hoy = new Date().toISOString().slice(0, 10);
  const contenido = {
    aviso:
      "Copia de tus datos en KleyBom. Contiene datos personales y de salud: guárdala en un lugar seguro.",
    generado: new Date().toISOString(),
    cuenta: { email: usuario.email, creada: usuario.created_at },
    perfil: perfil.data,
    objetivos_nutricion: objetivos.data,
    rutinas: rutinas.data,
    calendario: calendario.data,
    diario_comidas: diario.data,
    entrenos: entrenos.data,
    medidas: medidas.data,
  };

  return new Response(JSON.stringify(contenido, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kleybom-mis-datos-${hoy}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
