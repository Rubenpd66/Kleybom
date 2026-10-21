// Se ejecuta en el <head> antes de pintar: aplica el tema elegido a mano (si lo hay) para que no parpadee.
// Sin elección, manda el del sistema (prefers-color-scheme en globals.css).
export const SCRIPT_TEMA = `try{var t=localStorage.getItem("tema");if(t==="claro"||t==="oscuro")document.documentElement.dataset.tema=t}catch(e){}`;
