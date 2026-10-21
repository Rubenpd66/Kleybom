// Escenas 3D de fondo (three.js). Este módulo se carga bajo demanda, cuando el navegador está libre,
// para no retrasar la carga de la página. Colores de la marca; siempre sutiles y apartados del texto
// (la mayoría a la derecha), porque son decoración.
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  type Material,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  TorusGeometry,
  WebGLRenderer,
} from "three";
import type { Escena } from "@/lib/fondo/rutas";

const C = {
  acero: new Color("#4f5d68"),
  linea: new Color("#9aa5ad"),
  temple: new Color("#f0b429"),
  templeOsc: new Color("#8a5f00"),
  azul: new Color("#2f5d8a"),
  hierro: new Color("#1c2126"),
};

type Actualizar = (t: number) => void;
type Constructor = (escena: Scene, camara: PerspectiveCamera) => Actualizar;

// Números pseudoaleatorios repetibles: la misma escena se ve igual en cada visita.
function semilla(n: number) {
  let s = n;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function luces(escena: Scene) {
  escena.add(new AmbientLight(0xffffff, 1.6));
  const sol = new DirectionalLight(0xffffff, 1.4);
  sol.position.set(3, 5, 4);
  escena.add(sol);
}

const bordes = (geo: BufferGeometry, color: Color, opacidad = 0.6) =>
  new LineSegments(new EdgesGeometry(geo), new LineBasicMaterial({ color, transparent: true, opacity: opacidad }));

// Inicio: chispas de forja que suben (la marca nace del "temple del acero").
const chispas: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 8);
  const N = 420;
  const azar = semilla(7);
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = 1.5 + azar() * 6 - 1.5;
    pos[i * 3 + 1] = azar() * 9 - 4.5;
    pos[i * 3 + 2] = azar() * 4 - 2;
    vel[i] = 0.25 + azar() * 0.6;
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  const puntos = new Points(geo, new PointsMaterial({ color: C.temple, size: 0.07, transparent: true, opacity: 0.85 }));
  const brasas = new Points(geo, new PointsMaterial({ color: C.templeOsc, size: 0.035, transparent: true, opacity: 0.6 }));
  escena.add(puntos, brasas);
  let antes = 0;
  return (t) => {
    const dt = Math.min(0.1, t - antes);
    antes = t;
    const p = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      p[i * 3 + 1] += vel[i] * dt;
      p[i * 3] += Math.sin(t * 0.8 + i) * 0.002;
      if (p[i * 3 + 1] > 4.5) p[i * 3 + 1] = -4.5;
    }
    geo.attributes.position.needsUpdate = true;
  };
};

// Ejercicios: discos de pesas flotando y girando.
const discos: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 9);
  luces(escena);
  const azar = semilla(11);
  const grupo = new Group();
  const tam = [1.1, 0.8, 0.6, 1.3, 0.7, 0.9];
  tam.forEach((r, i) => {
    const geo = new TorusGeometry(r, r * 0.32, 12, 40);
    const disco = new Mesh(geo, new MeshLambertMaterial({ color: i % 3 === 0 ? C.temple : C.acero, transparent: true, opacity: 0.55 }));
    disco.position.set(2 + azar() * 4, azar() * 6 - 3, azar() * -3);
    disco.rotation.set(azar() * 3, azar() * 3, 0);
    disco.userData.giro = 0.15 + azar() * 0.3;
    grupo.add(disco);
  });
  escena.add(grupo);
  return (t) => {
    grupo.children.forEach((d, i) => {
      d.rotation.x += d.userData.giro * 0.016;
      d.rotation.y += d.userData.giro * 0.011;
      d.position.y += Math.sin(t * 0.6 + i) * 0.003;
    });
  };
};

// Rutinas: cuadrícula de series que se van "completando" columna a columna.
const series: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 10);
  luces(escena);
  const COL = 9;
  const FIL = 5;
  const malla = new InstancedMesh(new BoxGeometry(0.45, 0.45, 0.45), new MeshLambertMaterial({ transparent: true, opacity: 0.6 }), COL * FIL);
  const d = new Object3D();
  const color = new Color();
  escena.add(malla);
  malla.rotation.set(-0.35, -0.5, 0);
  malla.position.set(2.6, 0, 0);
  return (t) => {
    const activa = Math.floor(t * 1.2) % (COL + 3);
    for (let c = 0; c < COL; c++)
      for (let f = 0; f < FIL; f++) {
        const i = c * FIL + f;
        const hecha = c < activa;
        const escala = c === activa - 1 ? 1 + Math.max(0, Math.sin((t * 1.2 % 1) * Math.PI)) * 0.35 : 1;
        d.position.set((c - COL / 2) * 0.7, (f - FIL / 2) * 0.7, 0);
        d.scale.setScalar(escala);
        d.updateMatrix();
        malla.setMatrixAt(i, d.matrix);
        malla.setColorAt(i, color.copy(hecha ? C.temple : C.linea));
      }
    malla.instanceMatrix.needsUpdate = true;
    if (malla.instanceColor) malla.instanceColor.needsUpdate = true;
  };
};

// Calendario: carrusel de los 7 días de la semana; uno (hoy) en ámbar.
const semana: Constructor = (escena, camara) => {
  camara.position.set(0, 1.2, 9);
  camara.lookAt(0, 0, 0);
  luces(escena);
  const anillo = new Group();
  const hoy = (new Date().getDay() + 6) % 7;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const geo = new BoxGeometry(1.1, 1.3, 0.12);
    const casilla = new Mesh(geo, new MeshLambertMaterial({ color: i === hoy ? C.temple : C.linea, transparent: true, opacity: i === hoy ? 0.8 : 0.45 }));
    casilla.add(bordes(geo, C.acero, 0.5));
    casilla.position.set(Math.sin(a) * 3, 0, Math.cos(a) * 3);
    casilla.rotation.y = a;
    anillo.add(casilla);
  }
  anillo.position.set(3.2, 0, -1);
  escena.add(anillo);
  return (t) => {
    anillo.rotation.y = t * 0.18;
    anillo.position.y = Math.sin(t * 0.5) * 0.2;
  };
};

// Alimentos: gemas de los tres macronutrientes (mismos colores que la barra de calorías).
const nutrientes: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 9);
  luces(escena);
  const azar = semilla(23);
  const colores = [C.azul, C.temple, C.hierro];
  const gemas: Mesh[] = [];
  for (let i = 0; i < 14; i++) {
    const g = new Mesh(new IcosahedronGeometry(0.25 + azar() * 0.35, 0), new MeshLambertMaterial({ color: colores[i % 3], flatShading: true, transparent: true, opacity: 0.6 }));
    g.position.set(1 + azar() * 6, azar() * 7 - 3.5, azar() * -3);
    g.userData = { v: 0.2 + azar() * 0.4, fase: azar() * 6 };
    gemas.push(g);
    escena.add(g);
  }
  return (t) => {
    for (const g of gemas) {
      g.rotation.x = t * g.userData.v;
      g.rotation.y = t * g.userData.v * 0.7;
      g.position.y += Math.sin(t * 0.5 + g.userData.fase) * 0.004;
    }
  };
};

// Recetas: ingredientes en órbita alrededor de un plato.
const plato: Constructor = (escena, camara) => {
  camara.position.set(0, 3, 8);
  camara.lookAt(0, 0, 0);
  luces(escena);
  const centro = new Group();
  const base = new Mesh(new CylinderGeometry(1.6, 1.3, 0.15, 48), new MeshLambertMaterial({ color: C.linea, transparent: true, opacity: 0.55 }));
  centro.add(base);
  const azar = semilla(31);
  const orbita = new Group();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const forma = i % 3 === 0 ? new SphereGeometry(0.22, 16, 12) : i % 3 === 1 ? new BoxGeometry(0.3, 0.3, 0.3) : new IcosahedronGeometry(0.24, 0);
    const pieza = new Mesh(forma, new MeshLambertMaterial({ color: [C.temple, C.azul, C.acero][i % 3], transparent: true, opacity: 0.7 }));
    pieza.position.set(Math.cos(a) * 2.4, 0.4 + azar() * 0.6, Math.sin(a) * 2.4);
    orbita.add(pieza);
  }
  centro.add(orbita);
  centro.position.set(3, -0.5, 0);
  escena.add(centro);
  return (t) => {
    orbita.rotation.y = t * 0.25;
    orbita.children.forEach((p, i) => (p.rotation.y = t + i));
  };
};

// Diario: anillo de progreso que se va llenando, como las calorías del día.
const diario: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 9);
  luces(escena);
  const grupo = new Group();
  const fondo = new Mesh(new TorusGeometry(2, 0.12, 12, 96), new MeshLambertMaterial({ color: C.linea, transparent: true, opacity: 0.4 }));
  grupo.add(fondo);
  let arco = new Mesh(new TorusGeometry(2, 0.18, 12, 96, 0.01), new MeshLambertMaterial({ color: C.temple, transparent: true, opacity: 0.85 }));
  grupo.add(arco);
  grupo.position.set(3.3, 0.3, -1);
  escena.add(grupo);
  let paso = -1;
  return (t) => {
    // Rehace el arco 30 veces por ciclo (no en cada fotograma) para no generar geometría de más.
    const avance = (t * 0.12) % 1;
    const nuevo = Math.floor(avance * 30);
    if (nuevo !== paso) {
      paso = nuevo;
      grupo.remove(arco);
      arco.geometry.dispose();
      arco = new Mesh(new TorusGeometry(2, 0.18, 12, 96, Math.max(0.01, (nuevo / 30) * Math.PI * 2)), arco.material);
      arco.rotation.z = Math.PI / 2;
      grupo.add(arco);
    }
    grupo.rotation.y = Math.sin(t * 0.3) * 0.35;
  };
};

// Entreno: anillos de pulso que se expanden al ritmo de un latido.
const pulso: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 9);
  const grupo = new Group();
  const anillos = Array.from({ length: 4 }, () => {
    const m = new Mesh(new TorusGeometry(1, 0.04, 8, 80), new MeshLambertMaterial({ color: C.temple, transparent: true, opacity: 0.6, emissive: C.templeOsc }));
    grupo.add(m);
    return m;
  });
  const nucleo = new Mesh(new SphereGeometry(0.35, 24, 16), new MeshLambertMaterial({ color: C.temple, emissive: C.templeOsc }));
  grupo.add(nucleo);
  grupo.position.set(3.4, 0.2, -1);
  escena.add(grupo);
  luces(escena);
  return (t) => {
    const latido = Math.max(0, Math.sin(t * 2.4)) ** 8;
    nucleo.scale.setScalar(1 + latido * 0.35);
    anillos.forEach((a, i) => {
      const fase = ((t * 0.35 + i / anillos.length) % 1);
      a.scale.setScalar(0.6 + fase * 3);
      (a.material as MeshLambertMaterial).opacity = 0.6 * (1 - fase);
    });
  };
};

// Estadísticas: campo de barras que sube y baja como una gráfica viva.
const barras: Constructor = (escena, camara) => {
  camara.position.set(0, 5, 10);
  camara.lookAt(0, 0, 0);
  luces(escena);
  const X = 12;
  const Z = 6;
  const malla = new InstancedMesh(new BoxGeometry(0.35, 1, 0.35), new MeshLambertMaterial({ transparent: true, opacity: 0.6 }), X * Z);
  const d = new Object3D();
  const color = new Color();
  malla.position.set(3, -1.5, -1);
  malla.rotation.y = -0.5;
  escena.add(malla);
  return (t) => {
    for (let x = 0; x < X; x++)
      for (let z = 0; z < Z; z++) {
        const h = 0.4 + (Math.sin(x * 0.6 + t * 0.9) + Math.cos(z * 0.8 + t * 0.6) + 2) * 0.7;
        d.position.set((x - X / 2) * 0.5, h / 2, (z - Z / 2) * 0.5);
        d.scale.set(1, h, 1);
        d.updateMatrix();
        malla.setMatrixAt(x * Z + z, d.matrix);
        malla.setColorAt(x * Z + z, color.copy(z === Z - 1 ? C.azul : h > 2.3 ? C.temple : C.linea));
      }
    malla.instanceMatrix.needsUpdate = true;
    if (malla.instanceColor) malla.instanceColor.needsUpdate = true;
  };
};

// Guías: escalera en espiral con una bola que sube, la progresión paso a paso.
const camino: Constructor = (escena, camara) => {
  camara.position.set(0, 1, 10);
  camara.lookAt(0, 0, 0);
  luces(escena);
  const escalera = new Group();
  const N = 18;
  for (let i = 0; i < N; i++) {
    const a = i * 0.55;
    const geo = new BoxGeometry(1, 0.15, 0.5);
    const peldano = new Mesh(geo, new MeshLambertMaterial({ color: C.linea, transparent: true, opacity: 0.5 }));
    peldano.add(bordes(geo, C.acero, 0.5));
    peldano.position.set(Math.cos(a) * 1.6, i * 0.32 - 2.8, Math.sin(a) * 1.6);
    peldano.rotation.y = -a;
    escalera.add(peldano);
  }
  const bola = new Mesh(new SphereGeometry(0.2, 20, 14), new MeshLambertMaterial({ color: C.temple, emissive: C.templeOsc }));
  escalera.add(bola);
  escalera.position.set(3.4, 0, -1);
  escena.add(escalera);
  return (t) => {
    escalera.rotation.y = t * 0.15;
    const i = (t * 1.5) % N;
    const a = i * 0.55;
    bola.position.set(Math.cos(a) * 1.6, i * 0.32 - 2.55 + Math.abs(Math.sin(t * 4.7)) * 0.15, Math.sin(a) * 1.6);
  };
};

// Mi panel: constelación de puntos que se conectan (tus datos, enlazados).
const constelacion: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 9);
  const azar = semilla(41);
  const N = 40;
  const base = Array.from({ length: N }, () => [1 + azar() * 6.5, azar() * 7 - 3.5, azar() * 3 - 1.5]);
  const pos = new Float32Array(N * 3);
  const geoPuntos = new BufferGeometry();
  geoPuntos.setAttribute("position", new Float32BufferAttribute(pos, 3));
  escena.add(new Points(geoPuntos, new PointsMaterial({ color: C.azul, size: 0.12, transparent: true, opacity: 0.8 })));
  const MAX = 120;
  const lineas = new Float32Array(MAX * 6);
  const geoLineas = new BufferGeometry();
  geoLineas.setAttribute("position", new Float32BufferAttribute(lineas, 3));
  escena.add(new LineSegments(geoLineas, new LineBasicMaterial({ color: C.acero, transparent: true, opacity: 0.35 })));
  return (t) => {
    for (let i = 0; i < N; i++) {
      pos[i * 3] = base[i][0] + Math.sin(t * 0.3 + i) * 0.3;
      pos[i * 3 + 1] = base[i][1] + Math.cos(t * 0.25 + i * 1.3) * 0.3;
      pos[i * 3 + 2] = base[i][2];
    }
    let n = 0;
    for (let i = 0; i < N && n < MAX; i++)
      for (let j = i + 1; j < N && n < MAX; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        if (dx * dx + dy * dy < 1.6) {
          lineas.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]], n * 6);
          n++;
        }
      }
    geoLineas.setDrawRange(0, n * 2);
    geoPuntos.attributes.position.needsUpdate = true;
    geoLineas.attributes.position.needsUpdate = true;
  };
};

// Entrar y registro: malla ondulante y tranquila.
const malla: Constructor = (escena, camara) => {
  camara.position.set(0, 3, 8);
  camara.lookAt(0, 0, 0);
  const geo = new PlaneGeometry(14, 8, 40, 24);
  geo.rotateX(-Math.PI / 2);
  const superficie = new Mesh(geo, new MeshLambertMaterial({ color: C.azul, wireframe: true, transparent: true, opacity: 0.25 }));
  superficie.position.y = -2.3;
  escena.add(superficie);
  luces(escena);
  const original = Float32Array.from(geo.attributes.position.array);
  return (t) => {
    const p = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) p[i + 1] = original[i + 1] + Math.sin(original[i] * 0.6 + t * 0.8) * 0.35 + Math.cos(original[i + 2] * 0.8 + t * 0.5) * 0.25;
    geo.attributes.position.needsUpdate = true;
  };
};

const CONSTRUCTORES: Record<Escena, Constructor> = { chispas, discos, series, semana, nutrientes, plato, diario, pulso, barras, camino, constelacion, malla };

// Monta la escena en el lienzo. Devuelve la función para desmontarla.
// `quieta`: con "reducir movimiento" se pinta un solo fotograma y no se anima.
export function montarEscena(lienzo: HTMLCanvasElement, clave: Escena, quieta: boolean): () => void {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const render = new WebGLRenderer({ canvas: lienzo, alpha: true, antialias: dpr < 1.5, powerPreference: "low-power" });
  render.setPixelRatio(dpr);
  const escena = new Scene();
  const camara = new PerspectiveCamera(45, 1, 0.1, 100);
  const actualizar = CONSTRUCTORES[clave](escena, camara);

  // En pantallas estrechas el contenido ocupa todo el ancho: la escena se aleja y se centra un poco.
  const ajustar = () => {
    const { clientWidth: w, clientHeight: h } = lienzo;
    render.setSize(w, h, false);
    camara.aspect = w / Math.max(h, 1);
    camara.position.x = w < 768 ? -2 : 0;
    camara.updateProjectionMatrix();
  };
  ajustar();
  window.addEventListener("resize", ajustar);

  const inicio = performance.now();
  let id = 0;
  let ultimo = 0;
  const pintar = (ahora: number) => {
    const t = (ahora - inicio) / 1000;
    actualizar(t);
    render.render(escena, camara);
  };
  // Unos 30 fotogramas por segundo bastan para un fondo y gastan la mitad de batería.
  const bucle = (ahora: number) => {
    id = requestAnimationFrame(bucle);
    if (document.hidden || ahora - ultimo < 33) return;
    ultimo = ahora;
    pintar(ahora);
  };
  if (quieta) pintar(inicio + 4000);
  else id = requestAnimationFrame(bucle);
  lienzo.dataset.animando = quieta ? "no" : "si";

  return () => {
    cancelAnimationFrame(id);
    window.removeEventListener("resize", ajustar);
    escena.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose();
      const mat = m.material as Material | Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
    });
    render.dispose();
  };
}

// ¿Puede el navegador dibujar en 3D, y con tarjeta gráfica? Sin tarjeta (render por software:
// SwiftShader, llvmpipe…) el 3D lo hace la CPU: entonces se pinta un solo fotograma, sin animar.
export function capacidadWebGL(): "rapida" | "lenta" | "ninguna" {
  try {
    const gl = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    if (!gl) return "ninguna";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const tarjeta = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(tarjeta) ? "lenta" : "rapida";
  } catch {
    return "ninguna";
  }
}
