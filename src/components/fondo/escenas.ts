// Escenas 3D de fondo (three.js). Se cargan bajo demanda, cuando el navegador está libre (o, en móvil,
// tras el primer toque o desplazamiento), para no retrasar la carga de la página.
// Toman los colores del tema (claro u oscuro), siguen al ratón con un ligero paralaje y giran un poco al
// desplazarse. Siempre detrás del contenido y apartadas del texto (sobre todo a la derecha).
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineSegments,
  type Material,
  Mesh,
  MeshLambertMaterial,
  NormalBlending,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  type Texture,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Escena } from "@/lib/fondo/rutas";

// Colores del tema, leídos de las variables CSS al montar la escena.
type Paleta = { fondo: Color; texto: Color; acero: Color; linea: Color; temple: Color; templeOsc: Color; oscuro: boolean };
let C: Paleta;
let BRILLO: Texture;

function leerPaleta(): Paleta {
  const css = getComputedStyle(document.documentElement);
  const v = (n: string) => new Color(css.getPropertyValue(n).trim() || "#888888");
  const fondo = v("--tiza");
  return { fondo, texto: v("--hierro"), acero: v("--acero"), linea: v("--linea"), temple: v("--temple"), templeOsc: v("--temple-osc"), oscuro: fondo.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5 };
}

// Textura de punto luminoso (degradado radial) para chispas y estrellas.
function texturaBrillo(): Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const d = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  d.addColorStop(0, "rgba(255,255,255,1)");
  d.addColorStop(0.35, "rgba(255,255,255,0.55)");
  d.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = d;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

const puntosBrillantes = (color: Color, tam: number, opacidad = 0.9) =>
  new PointsMaterial({ color, size: tam, map: BRILLO, transparent: true, opacity: opacidad, depthWrite: false, blending: C.oscuro ? AdditiveBlending : NormalBlending });

type Actualizar = (t: number) => void;
type Constructor = (escena: Scene, camara: PerspectiveCamera, ligero: boolean) => Actualizar;

// Números pseudoaleatorios repetibles: la misma escena se ve igual en cada visita.
function semilla(n: number) {
  let s = n;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function luces(escena: Scene) {
  escena.add(new AmbientLight(0xffffff, C.oscuro ? 0.9 : 1.6));
  const sol = new DirectionalLight(0xffffff, C.oscuro ? 1.8 : 1.4);
  sol.position.set(3, 5, 4);
  escena.add(sol);
  const contra = new DirectionalLight(C.temple, C.oscuro ? 1.2 : 0.5);
  contra.position.set(-4, -2, -3);
  escena.add(contra);
}

const mate = (color: Color, opacidad = 0.8) => new MeshLambertMaterial({ color, transparent: true, opacity: opacidad });
const bordes = (geo: BufferGeometry, color: Color, opacidad = 0.6) =>
  new LineSegments(new EdgesGeometry(geo), new LineBasicMaterial({ color, transparent: true, opacity: opacidad }));

// ── Inicio: acero forjado con vetas de metal fundido (shader propio) y chispas que suben. ──
const RUIDO = `
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}`;

const chispas: Constructor = (escena, camara, ligero) => {
  camara.position.set(0, 0, 9);
  const forja = new Mesh(
    new PlaneGeometry(9, 9, 1, 1),
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      uniforms: { uT: { value: 0 }, uBase: { value: C.acero }, uFuego: { value: C.temple }, uBrillo: { value: C.oscuro ? new Color("#fff1c9") : C.templeOsc } },
      vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader: `uniform float uT; uniform vec3 uBase,uFuego,uBrillo; varying vec2 vUv; ${RUIDO}
        void main(){
          vec2 p=vUv*3.2;
          float q=fbm(p+vec2(0.,uT*.12));
          float r=fbm(p+q*1.9+vec2(uT*.05,-uT*.09));
          float vena=smoothstep(.52,.72,r);
          vec3 c=mix(uBase,uFuego,vena);
          c=mix(c,uBrillo,smoothstep(.70,.86,r));
          vec2 d=abs(vUv-.5)*2.;
          float borde=1.-smoothstep(.35,1.,max(d.x,d.y));
          gl_FragColor=vec4(c,borde*(.18+vena*.82));
        }`,
    }),
  );
  forja.position.set(3.4, -1.2, -2);
  forja.rotation.set(-1.0, 0, 0.35);
  escena.add(forja);

  const N = ligero ? 160 : 360;
  const azar = semilla(7);
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos.set([1.5 + azar() * 5, azar() * 9 - 4.5, azar() * 3 - 2], i * 3);
    vel[i] = 0.3 + azar() * 0.7;
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  escena.add(new Points(geo, puntosBrillantes(C.temple, 0.16)));
  let antes = 0;
  return (t) => {
    (forja.material as ShaderMaterial).uniforms.uT.value = t;
    const dt = Math.min(0.1, t - antes);
    antes = t;
    const p = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      p[i * 3 + 1] += vel[i] * dt;
      p[i * 3] += Math.sin(t * 0.9 + i) * 0.003;
      if (p[i * 3 + 1] > 4.5) p[i * 3 + 1] = -3;
    }
    geo.attributes.position.needsUpdate = true;
  };
};

// ── Ejercicios: barra olímpica con discos que gira despacio y discos sueltos en órbita. ──
const discos: Constructor = (escena, camara) => {
  camara.position.set(0, 0.6, 9);
  luces(escena);
  const barra = new Group();
  const acero = mate(C.acero, 0.95);
  const eje = new Mesh(new CylinderGeometry(0.06, 0.06, 6.2, 16), acero);
  eje.rotation.z = Math.PI / 2;
  barra.add(eje);
  // Discos a cada lado: de más grande (dentro) a más pequeño (fuera).
  for (const lado of [-1, 1]) {
    [0.95, 0.75, 0.55].forEach((r, i) => {
      const disco = new Mesh(new CylinderGeometry(r, r, 0.16, 40), mate(i === 0 ? C.temple : C.acero, 0.92));
      disco.rotation.z = Math.PI / 2;
      disco.position.x = lado * (2 + i * 0.2);
      barra.add(disco);
    });
    const tope = new Mesh(new CylinderGeometry(0.12, 0.12, 0.12, 16), acero);
    tope.rotation.z = Math.PI / 2;
    tope.position.x = lado * 2.6;
    barra.add(tope);
  }
  barra.position.set(3, 0.4, -1);
  barra.rotation.set(0.25, -0.5, 0.1);
  escena.add(barra);

  const azar = semilla(11);
  const sueltos = new Group();
  for (let i = 0; i < 5; i++) {
    const r = 0.35 + azar() * 0.4;
    const d = new Mesh(new TorusGeometry(r, r * 0.33, 10, 36), mate(i % 2 ? C.linea : C.temple, 0.55));
    d.userData = { a: (i / 5) * Math.PI * 2, rad: 3.2 + azar(), v: 0.15 + azar() * 0.15 };
    sueltos.add(d);
  }
  sueltos.position.copy(barra.position);
  escena.add(sueltos);
  return (t) => {
    barra.rotation.x = 0.25 + Math.sin(t * 0.4) * 0.12;
    barra.rotation.y = -0.5 + t * 0.12;
    sueltos.children.forEach((d) => {
      const a = d.userData.a + t * d.userData.v;
      d.position.set(Math.cos(a) * d.userData.rad, Math.sin(a * 1.3) * 1.4, Math.sin(a) * d.userData.rad * 0.6);
      d.rotation.set(t * 0.5, t * 0.3, 0);
    });
  };
};

// ── Rutinas: cuadrícula de series que se van "completando" columna a columna, con ola. ──
const series: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 10);
  luces(escena);
  const COL = 9;
  const FIL = 5;
  const malla = new InstancedMesh(new BoxGeometry(0.42, 0.42, 0.42), new MeshLambertMaterial({ transparent: true, opacity: 0.8 }), COL * FIL);
  const d = new Object3D();
  const color = new Color();
  escena.add(malla);
  malla.rotation.set(-0.4, -0.55, 0);
  malla.position.set(2.8, 0, -0.5);
  return (t) => {
    const activa = Math.floor(t * 1.2) % (COL + 3);
    for (let c = 0; c < COL; c++)
      for (let f = 0; f < FIL; f++) {
        const i = c * FIL + f;
        const hecha = c < activa;
        const salto = c === activa - 1 ? Math.max(0, Math.sin(((t * 1.2) % 1) * Math.PI)) * 0.5 : 0;
        d.position.set((c - COL / 2) * 0.68, (f - FIL / 2) * 0.68, Math.sin(c * 0.6 + f * 0.4 + t * 1.3) * 0.25 + salto);
        d.rotation.set(0, 0, hecha ? 0 : Math.PI / 4 * Math.sin(t + c));
        d.scale.setScalar(hecha ? 1 : 0.7);
        d.updateMatrix();
        malla.setMatrixAt(i, d.matrix);
        malla.setColorAt(i, color.copy(hecha ? C.temple : C.linea));
      }
    malla.instanceMatrix.needsUpdate = true;
    if (malla.instanceColor) malla.instanceColor.needsUpdate = true;
  };
};

// ── Calendario: carrusel de los 7 días; hoy brilla en ámbar con un halo. ──
const semana: Constructor = (escena, camara) => {
  camara.position.set(0, 1.2, 9);
  luces(escena);
  const anillo = new Group();
  const hoy = (new Date().getDay() + 6) % 7;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const geo = new BoxGeometry(1.1, 1.35, 0.1);
    const casilla = new Mesh(geo, mate(i === hoy ? C.temple : C.linea, i === hoy ? 0.95 : 0.55));
    casilla.add(bordes(geo, i === hoy ? C.templeOsc : C.acero, 0.6));
    casilla.position.set(Math.sin(a) * 3, 0, Math.cos(a) * 3);
    casilla.rotation.y = a;
    if (i === hoy) {
      const halo = new Points(new BufferGeometry().setAttribute("position", new Float32BufferAttribute([0, 0, 0.2], 3)), puntosBrillantes(C.temple, 3.2, 0.5));
      casilla.add(halo);
    }
    anillo.add(casilla);
  }
  anillo.position.set(4.6, -1.8, -2);
  escena.add(anillo);
  return (t) => {
    anillo.rotation.y = t * 0.18;
    anillo.position.y = Math.sin(t * 0.5) * 0.2;
  };
};

// ── Alimentos: moléculas (átomos unidos por enlaces) de tres colores, como los macronutrientes. ──
const nutrientes: Constructor = (escena, camara, ligero) => {
  camara.position.set(0, 0, 10);
  luces(escena);
  const azar = semilla(23);
  const colores = [C.temple, C.acero, C.linea];
  const moleculas: Group[] = [];
  const atomo = new SphereGeometry(0.22, 18, 14);
  for (let m = 0; m < (ligero ? 4 : 7); m++) {
    const g = new Group();
    const n = 3 + Math.floor(azar() * 4);
    const puntos: Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const p = i === 0 ? new Vector3() : puntos[Math.floor(azar() * i)].clone().add(new Vector3(azar() - 0.5, azar() - 0.5, azar() - 0.5).normalize().multiplyScalar(0.75));
      puntos.push(p);
      const a = new Mesh(atomo, mate(colores[(m + i) % 3], 0.9));
      a.position.copy(p);
      a.scale.setScalar(i === 0 ? 1.4 : 1);
      g.add(a);
      if (i > 0) {
        // Enlace: un cilindro fino entre el átomo nuevo y el más cercano.
        const otro = puntos.slice(0, i).reduce((x, y) => (x.distanceTo(p) < y.distanceTo(p) ? x : y));
        const largo = otro.distanceTo(p);
        const enlace = new Mesh(new CylinderGeometry(0.05, 0.05, largo, 8), mate(C.acero, 0.6));
        enlace.position.copy(otro).add(p).multiplyScalar(0.5);
        enlace.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), p.clone().sub(otro).normalize()));
        g.add(enlace);
      }
    }
    g.position.set(1.2 + azar() * 6, azar() * 7 - 3.5, azar() * -3);
    g.userData = { v: 0.15 + azar() * 0.3, fase: azar() * 6 };
    moleculas.push(g);
    escena.add(g);
  }
  return (t) => {
    for (const g of moleculas) {
      g.rotation.set(t * g.userData.v, t * g.userData.v * 0.8, 0);
      g.position.y += Math.sin(t * 0.5 + g.userData.fase) * 0.004;
    }
  };
};

// ── Recetas: ingredientes en órbita alrededor de un plato. ──
const plato: Constructor = (escena, camara) => {
  camara.position.set(0, 3, 8);
  luces(escena);
  const centro = new Group();
  centro.add(new Mesh(new CylinderGeometry(1.6, 1.25, 0.14, 48), mate(C.linea, 0.75)));
  const azar = semilla(31);
  const orbita = new Group();
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const forma = i % 3 === 0 ? new SphereGeometry(0.22, 16, 12) : i % 3 === 1 ? new BoxGeometry(0.3, 0.3, 0.3) : new IcosahedronGeometry(0.24, 0);
    const pieza = new Mesh(forma, mate([C.temple, C.acero, C.linea][i % 3], 0.9));
    pieza.position.set(Math.cos(a) * 2.4, 0.4 + azar() * 0.8, Math.sin(a) * 2.4);
    orbita.add(pieza);
  }
  centro.add(orbita);
  centro.position.set(3.2, 0.3, -0.5);
  escena.add(centro);
  return (t) => {
    orbita.rotation.y = t * 0.25;
    orbita.children.forEach((p, i) => {
      p.rotation.set(t + i, t * 0.7, 0);
      p.position.y = 0.6 + Math.sin(t * 1.2 + i) * 0.35;
    });
  };
};

// ── Diario: anillo de progreso que se llena, con alimentos (puntos) que caen dentro. ──
const diario: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 9);
  luces(escena);
  const grupo = new Group();
  grupo.add(new Mesh(new TorusGeometry(2, 0.1, 12, 96), mate(C.linea, 0.6)));
  const materialArco = mate(C.temple, 0.95);
  let arco = new Mesh(new TorusGeometry(2, 0.17, 12, 96, 0.01), materialArco);
  grupo.add(arco);
  const N = 40;
  const azar = semilla(5);
  const pos = new Float32Array(N * 3);
  const caida = Array.from({ length: N }, () => ({ a: azar() * Math.PI * 2, r: 0.3 + azar() * 1.4, v: 0.3 + azar() * 0.5, f: azar() }));
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  grupo.add(new Points(geo, puntosBrillantes(C.temple, 0.18, 0.8)));
  grupo.position.set(3.3, 0.3, -1);
  escena.add(grupo);
  let paso = -1;
  return (t) => {
    // Rehace el arco 30 veces por vuelta (no en cada fotograma) para no generar geometría de más.
    const nuevo = Math.floor(((t * 0.12) % 1) * 30);
    if (nuevo !== paso) {
      paso = nuevo;
      grupo.remove(arco);
      arco.geometry.dispose();
      arco = new Mesh(new TorusGeometry(2, 0.17, 12, 96, Math.max(0.01, (nuevo / 30) * Math.PI * 2)), materialArco);
      arco.rotation.z = Math.PI / 2;
      grupo.add(arco);
    }
    caida.forEach((c, i) => {
      const y = 2.5 - (((t * c.v + c.f) % 1) * 5);
      pos.set([Math.cos(c.a + t * 0.2) * c.r, y, Math.sin(c.a + t * 0.2) * c.r * 0.4], i * 3);
    });
    geo.attributes.position.needsUpdate = true;
    grupo.rotation.y = Math.sin(t * 0.3) * 0.35;
  };
};

// ── Entreno: electrocardiograma luminoso que avanza y anillos de pulso con cada latido. ──
const pulso: Constructor = (escena, camara) => {
  camara.position.set(0, 0, 9);
  luces(escena);
  const PUNTOS = 220;
  const linea = new BufferGeometry();
  const pos = new Float32Array(PUNTOS * 3);
  linea.setAttribute("position", new BufferAttribute(pos, 3));
  const ecg = new Line(linea, new LineBasicMaterial({ color: C.temple, transparent: true, opacity: 0.95 }));
  ecg.position.set(3, 1.6, -1);
  ecg.frustumCulled = false; // sus puntos cambian en cada fotograma
  escena.add(ecg);
  // Forma de un latido (onda P, complejo QRS y onda T) repetida a lo largo del eje x.
  const latido = (x: number) => {
    const f = ((x % 2) + 2) % 2;
    if (f > 0.7 && f < 0.78) return (f - 0.7) * -6;
    if (f >= 0.78 && f < 0.86) return -0.48 + (f - 0.78) * 30;
    if (f >= 0.86 && f < 0.94) return 1.92 - (f - 0.86) * 30;
    if (f >= 0.2 && f < 0.4) return Math.sin(((f - 0.2) / 0.2) * Math.PI) * 0.18;
    if (f >= 1.1 && f < 1.45) return Math.sin(((f - 1.1) / 0.35) * Math.PI) * 0.32;
    return 0;
  };
  const grupo = new Group();
  const anillos = Array.from({ length: 4 }, () => {
    const m = new Mesh(new TorusGeometry(1, 0.035, 8, 80), mate(C.temple, 0.6));
    grupo.add(m);
    return m;
  });
  grupo.add(new Points(new BufferGeometry().setAttribute("position", new Float32BufferAttribute([0, 0, 0], 3)), puntosBrillantes(C.temple, 2.2, 0.7)));
  grupo.position.set(3.4, -1.4, -1.5);
  escena.add(grupo);
  return (t) => {
    for (let i = 0; i < PUNTOS; i++) {
      const x = (i / PUNTOS) * 6 - 3;
      pos.set([x, latido(x * 0.7 + t * 1.2) * 0.8, 0], i * 3);
    }
    linea.attributes.position.needsUpdate = true;
    anillos.forEach((a, i) => {
      const fase = (t * 0.6 + i / anillos.length) % 1;
      a.scale.setScalar(0.4 + fase * 2.6);
      (a.material as MeshLambertMaterial).opacity = 0.65 * (1 - fase);
    });
  };
};

// ── Estadísticas: campo de barras que sube y baja como una gráfica viva. ──
const barras: Constructor = (escena, camara, ligero) => {
  camara.position.set(0, 5, 10);
  luces(escena);
  const X = ligero ? 9 : 12;
  const Z = ligero ? 5 : 7;
  const malla = new InstancedMesh(new BoxGeometry(0.34, 1, 0.34), new MeshLambertMaterial({ transparent: true, opacity: 0.85 }), X * Z);
  const d = new Object3D();
  const color = new Color();
  malla.position.set(3, -1.6, -1);
  malla.rotation.y = -0.55;
  escena.add(malla);
  return (t) => {
    for (let x = 0; x < X; x++)
      for (let z = 0; z < Z; z++) {
        const h = 0.3 + (Math.sin(x * 0.55 + t * 0.9) + Math.cos(z * 0.8 + t * 0.6) + 2) * 0.75;
        d.position.set((x - X / 2) * 0.48, h / 2, (z - Z / 2) * 0.48);
        d.scale.set(1, h, 1);
        d.updateMatrix();
        malla.setMatrixAt(x * Z + z, d.matrix);
        malla.setColorAt(x * Z + z, color.copy(h > 2.4 ? C.temple : z === Z - 1 ? C.acero : C.linea));
      }
    malla.instanceMatrix.needsUpdate = true;
    if (malla.instanceColor) malla.instanceColor.needsUpdate = true;
  };
};

// ── Guías: escalera en espiral con una bola luminosa que sube peldaño a peldaño. ──
const camino: Constructor = (escena, camara) => {
  camara.position.set(0, 1, 10);
  luces(escena);
  const escalera = new Group();
  const N = 18;
  for (let i = 0; i < N; i++) {
    const a = i * 0.55;
    const geo = new BoxGeometry(1, 0.14, 0.5);
    const peldano = new Mesh(geo, mate(C.linea, 0.7));
    peldano.add(bordes(geo, C.acero, 0.5));
    peldano.position.set(Math.cos(a) * 1.6, i * 0.32 - 2.8, Math.sin(a) * 1.6);
    peldano.rotation.y = -a;
    escalera.add(peldano);
  }
  const bola = new Mesh(new SphereGeometry(0.2, 20, 14), mate(C.temple, 1));
  bola.add(new Points(new BufferGeometry().setAttribute("position", new Float32BufferAttribute([0, 0, 0], 3)), puntosBrillantes(C.temple, 1.6, 0.6)));
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

// ── Mi panel: constelación de puntos luminosos que se conectan (tus datos, enlazados). ──
const constelacion: Constructor = (escena, camara, ligero) => {
  camara.position.set(0, 0, 9);
  const azar = semilla(41);
  const N = ligero ? 26 : 46;
  const base = Array.from({ length: N }, () => [1 + azar() * 6.5, azar() * 7 - 3.5, azar() * 3 - 1.5]);
  const pos = new Float32Array(N * 3);
  const geoPuntos = new BufferGeometry();
  geoPuntos.setAttribute("position", new BufferAttribute(pos, 3));
  escena.add(new Points(geoPuntos, puntosBrillantes(C.temple, 0.32)));
  const MAX = 140;
  const lineas = new Float32Array(MAX * 6);
  const geoLineas = new BufferGeometry();
  geoLineas.setAttribute("position", new BufferAttribute(lineas, 3));
  const enlaces = new LineSegments(geoLineas, new LineBasicMaterial({ color: C.acero, transparent: true, opacity: 0.4 }));
  enlaces.frustumCulled = false; // sus puntos cambian en cada fotograma
  escena.add(enlaces);
  return (t) => {
    for (let i = 0; i < N; i++) {
      pos[i * 3] = base[i][0] + Math.sin(t * 0.3 + i) * 0.35;
      pos[i * 3 + 1] = base[i][1] + Math.cos(t * 0.25 + i * 1.3) * 0.35;
      pos[i * 3 + 2] = base[i][2];
    }
    let n = 0;
    for (let i = 0; i < N && n < MAX; i++)
      for (let j = i + 1; j < N && n < MAX; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        if (dx * dx + dy * dy < 1.7) {
          lineas.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]], n * 6);
          n++;
        }
      }
    geoLineas.setDrawRange(0, n * 2);
    geoPuntos.attributes.position.needsUpdate = true;
    geoLineas.attributes.position.needsUpdate = true;
  };
};

// ── Entrar y registro: terreno de malla ondulante. ──
const malla: Constructor = (escena, camara, ligero) => {
  camara.position.set(0, 3, 8);
  const geo = new PlaneGeometry(16, 9, ligero ? 28 : 46, ligero ? 16 : 26);
  geo.rotateX(-Math.PI / 2);
  const superficie = new Mesh(geo, new MeshLambertMaterial({ color: C.acero, wireframe: true, transparent: true, opacity: 0.35 }));
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

// Monta la escena en el lienzo y devuelve la función para desmontarla.
// `quieta`: se pinta un solo fotograma (reducir movimiento o sin tarjeta gráfica).
// `ligero`: versión para móvil (menos objetos, resolución 1x, menos fotogramas).
export function montarEscena(lienzo: HTMLCanvasElement, clave: Escena, { quieta, ligero }: { quieta: boolean; ligero: boolean }): () => void {
  C = leerPaleta();
  BRILLO = texturaBrillo();
  const dpr = ligero ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  const render = new WebGLRenderer({ canvas: lienzo, alpha: true, antialias: !ligero && dpr < 1.5, powerPreference: "low-power" });
  render.setPixelRatio(dpr);
  const escena = new Scene();
  // La niebla funde lo lejano con el color de fondo: da profundidad sin añadir nada.
  escena.fog = new Fog(C.fondo, 9, 18);
  const camara = new PerspectiveCamera(45, 1, 0.1, 100);
  const actualizar = CONSTRUCTORES[clave](escena, camara, ligero);
  const base = camara.position.clone();
  const mira = new Vector3(0, 0, 0);

  // En pantallas estrechas el contenido ocupa todo el ancho: la escena se centra un poco más.
  const ajustar = () => {
    const { clientWidth: w, clientHeight: h } = lienzo;
    render.setSize(w, h, false);
    camara.aspect = w / Math.max(h, 1);
    base.x = w < 768 ? 2.5 : 0;
    camara.updateProjectionMatrix();
  };
  ajustar();
  window.addEventListener("resize", ajustar);

  // Paralaje: la cámara se desplaza un poco hacia el ratón; al desplazar la página, la escena gira.
  const raton = { x: 0, y: 0 };
  const alMover = (e: PointerEvent) => {
    raton.x = (e.clientX / window.innerWidth) * 2 - 1;
    raton.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", alMover, { passive: true });

  const inicio = performance.now();
  let id = 0;
  let ultimo = 0;
  const intervalo = ligero ? 42 : 33; // unos 24 fps en móvil, 30 en ordenador: de sobra para un fondo
  const pintar = (ahora: number) => {
    const t = (ahora - inicio) / 1000;
    actualizar(t);
    camara.position.x += (base.x + raton.x * 0.7 - camara.position.x) * 0.05;
    camara.position.y += (base.y - raton.y * 0.45 - camara.position.y) * 0.05;
    camara.position.z = base.z;
    escena.rotation.y = Math.min(window.scrollY / 4000, 0.35);
    camara.lookAt(mira);
    render.render(escena, camara);
  };
  const bucle = (ahora: number) => {
    id = requestAnimationFrame(bucle);
    if (document.hidden || ahora - ultimo < intervalo) return;
    ultimo = ahora;
    pintar(ahora);
  };
  if (quieta) {
    camara.position.copy(base);
    pintar(inicio + 4000);
  } else id = requestAnimationFrame(bucle);
  lienzo.dataset.animando = quieta ? "no" : "si";

  return () => {
    cancelAnimationFrame(id);
    window.removeEventListener("resize", ajustar);
    window.removeEventListener("pointermove", alMover);
    escena.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose();
      const mat = m.material as Material | Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
    });
    BRILLO.dispose();
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
