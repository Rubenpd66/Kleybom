# Fuentes de datos

## wger (ejercicios)
- **Qué es:** base de datos abierta de ejercicios. API: https://wger.de/api/v2/exerciseinfo/
- **Licencias vistas en los datos:** CC-BY-SA 3, CC-BY-SA 4 y CC0. Cada ejercicio trae su licencia y su autor.
- **Qué exigen:** CC-BY-SA pide indicar el autor y la licencia y compartir las adaptaciones con la misma licencia. Por eso cada ejercicio guarda `license` y `author`, y la ficha los debe mostrar.
- **Qué se descarta:** ejercicios sin licencia, sin autor o sin nombre (simulación del 21/10/2026: 122 de 932).
- **Imágenes:** solo se guardan si la imagen tiene licencia y autor propios. Si no, queda vacía y se generará una con Nano Banana.
- **Pendiente de revisar tras importar:** `needs_translation` (texto en inglés, traducir al español) y `needs_level_review` (wger no indica nivel; se pone "intermedio" provisional).
- **Cómo se importa:** `node scripts/import-wger/run.ts --dry-run` cuenta sin escribir; sin `--dry-run` escribe en Supabase y necesita `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`. Se puede repetir sin duplicar.
