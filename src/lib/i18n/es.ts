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
};
