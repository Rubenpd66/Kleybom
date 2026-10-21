export type EnlaceNav = { href: string; label: string };

export const es = {
  marca: "Forja",
  meta: {
    titulo: "Forja — ejercicios, rutinas y nutrición",
    descripcion:
      "Web gratuita de fitness y salud: selector de ejercicios, rutinas, calendario, nutrición y estadísticas.",
  },
  nav: {
    etiqueta: "Principal",
    enlaces: [
      { href: "/ejercicios", label: "Ejercicios" },
      { href: "/rutinas", label: "Rutinas" },
      { href: "/calendario", label: "Calendario" },
      { href: "/nutricion", label: "Nutrición" },
      { href: "/estadisticas", label: "Estadísticas" },
    ] satisfies EnlaceNav[],
    entrar: "Entrar",
    abrirMenu: "Abrir menú",
    cerrarMenu: "Cerrar menú",
    saltarAlContenido: "Saltar al contenido",
  },
  footer: {
    aviso:
      "Forja ofrece información general y no sustituye a un médico, nutricionista o entrenador. Si tienes una condición de salud, consulta antes con un profesional.",
    enlaces: [
      { href: "/aviso-legal", label: "Aviso legal" },
      { href: "/privacidad", label: "Privacidad" },
      { href: "/cookies", label: "Cookies" },
    ] satisfies EnlaceNav[],
  },
  ejercicios: {
    titulo: "Ejercicios",
    descripcion: "Busca ejercicios por nombre, músculo, material y nivel.",
    buscar: "Buscar",
    buscarEtiqueta: "Buscar por nombre",
    musculo: "Músculo",
    material: "Material",
    nivel: "Nivel",
    todos: "Todos",
    niveles: { principiante: "Principiante", intermedio: "Intermedio", avanzado: "Avanzado" },
    listaEtiqueta: "Ejercicios",
    vacio: "No hay ejercicios con esos filtros. Prueba con otra palabra o quita algún filtro.",
    cargando: "Cargando ejercicios…",
    quitarFiltros: "Quitar filtros",
    anterior: "Anterior",
    siguiente: "Siguiente",
    resultados: (n: number) => (n === 1 ? "1 ejercicio" : `${n} ejercicios`),
    pagina: (a: number, t: number) => `Página ${a} de ${t}`,
  },
};
