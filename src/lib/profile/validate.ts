export type PerfilEntrada = { nombre: string; sexo: string; nacimiento: string; altura: string };

export type PerfilDatos = {
  display_name: string | null;
  sex: "mujer" | "hombre" | "otro" | null;
  birth_date: string | null;
  height_cm: number | null;
};

const SEXOS = ["mujer", "hombre", "otro"] as const;

function fechaValida(texto: string, hoy: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const f = new Date(`${texto}T00:00:00Z`);
  if (Number.isNaN(f.getTime()) || f.toISOString().slice(0, 10) !== texto) return false;
  return f.getUTCFullYear() >= 1900 && f.getTime() <= hoy.getTime();
}

export function validarPerfil(
  e: PerfilEntrada,
  hoy: Date = new Date(),
): { datos: PerfilDatos } | { error: string } {
  const nombre = e.nombre.trim();
  if (nombre.length > 60) return { error: "El nombre puede tener como máximo 60 caracteres." };

  const sexo = e.sexo.trim();
  if (sexo && !SEXOS.includes(sexo as (typeof SEXOS)[number]))
    return { error: "Elige una de las opciones de sexo de la lista." };

  const nacimiento = e.nacimiento.trim();
  if (nacimiento && !fechaValida(nacimiento, hoy))
    return { error: "La fecha de nacimiento no es válida. Usa el formato día/mes/año y no pongas una fecha futura." };

  const textoAltura = e.altura.trim().replace(",", ".");
  let altura: number | null = null;
  if (textoAltura) {
    altura = Number(textoAltura);
    if (!Number.isFinite(altura) || altura < 100 || altura > 250)
      return { error: "La altura debe ser un número en centímetros entre 100 y 250." };
  }

  return {
    datos: {
      display_name: nombre || null,
      sex: (sexo || null) as PerfilDatos["sex"],
      birth_date: nacimiento || null,
      height_cm: altura,
    },
  };
}
