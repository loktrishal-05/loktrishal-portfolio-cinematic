import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function scenePose(value) {
  const p = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const open = THREE.MathUtils.smoothstep(p, 0.18, 0.86);
  return { progress: p, open, rotation: p * Math.PI * 1.35, distance: 8.9 - p * 0.85 };
}

export function mountScene({ canvas, onReady = () => {}, onFailure = () => {}, reducedMotion = false, mobile = false }) {
  let renderer;
  try {
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' });
    if (!context) { onFailure(); return null; }
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  } catch { onFailure(); return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(environment, 0.035);
  world.environment = env.texture;
  environment.dispose();
  pmrem.dispose();
  world.add(new THREE.HemisphereLight(0xf8fbff, 0x777e96, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 3.5);
  key.position.set(-4, 6, 5);
  world.add(key);
  const rim = new THREE.DirectionalLight(0xadc0ff, 2.2);
  rim.position.set(4, 2, -3);
  world.add(rim);
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xc9d0da, metalness: 1, roughness: 0.19, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.55 });
  const pale = new THREE.MeshPhysicalMaterial({ color: 0xe6eaf0, metalness: 0.82, roughness: 0.24, clearcoat: 1 });
  const cobalt = new THREE.MeshPhysicalMaterial({ color: 0x2955dd, metalness: 0.62, roughness: 0.22, clearcoat: 1, envMapIntensity: 1.25 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x26334e, metalness: 0.86, roughness: 0.22 });
  const assembly = new THREE.Group();
  world.add(assembly);
  const rings = [];
  const segments = mobile ? 100 : 160;
  for (let i = 0; i < 4; i++) {
    const group = new THREE.Group();
    const radius = 1.62 + i * 0.24;
    const geometry = new THREE.TorusGeometry(radius, 0.185, 12, segments);
    geometry.scale(1, 1, 0.32);
    const mesh = new THREE.Mesh(geometry, i === 2 ? pale : chrome);
    group.add(mesh);
    const accent = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.006, 0.018, 6, 70, Math.PI * 0.42), cobalt);
    accent.position.z = 0.058;
    accent.rotation.z = i * 1.1;
    group.add(accent);
    const base = [0.36 + i * 0.6, 0.32 + i * 0.62, -0.32 + i * 0.42];
    group.rotation.set(...base);
    assembly.add(group);
    rings.push({ group, base });
  }
  const core = new THREE.Group();
  const jewel = new THREE.Mesh(new THREE.IcosahedronGeometry(0.81, 0), cobalt);
  core.add(jewel);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(jewel.geometry), new THREE.LineBasicMaterial({ color: 0x9fb5ff, transparent: true, opacity: 0.6 }));
  core.add(edges);
  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.92, 0), new THREE.MeshPhysicalMaterial({ color: 0xe7edff, metalness: 1, roughness: 0.18, wireframe: true }));
  core.add(inner);
  assembly.add(core);
  const panels = [];
  const panelGeometry = new THREE.BoxGeometry(0.16, 0.38, 0.12);
  const beadGeometry = new THREE.SphereGeometry(0.045, 8, 6);
  for (let i = 0; i < 18; i++) {
    const angle = i / 18 * Math.PI * 2;
    const panel = new THREE.Mesh(panelGeometry, i % 6 === 0 ? cobalt : graphite);
    panel.position.set(Math.cos(angle) * 2.52, Math.sin(angle) * 2.52, 0);
    panel.rotation.z = angle;
    assembly.add(panel);
    panels.push({ mesh: panel, angle });
    const bead = new THREE.Mesh(beadGeometry, pale);
    bead.position.set(Math.cos(angle) * 1.29, Math.sin(angle) * 1.29, 0.55);
    core.add(bead);
  }
  const shadowData = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const d = Math.hypot((x - 32) / 32, (y - 32) / 32);
    const at = (y * 64 + x) * 4;
    shadowData[at] = 35; shadowData[at + 1] = 43; shadowData[at + 2] = 69;
    shadowData[at + 3] = Math.round(Math.pow(Math.max(0, 1 - d), 2.5) * 58);
  }
  const shadowTexture = new THREE.DataTexture(shadowData, 64, 64);
  shadowTexture.needsUpdate = true;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 1.05), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
  shadow.position.set(0, -2.9, -0.8);
  world.add(shadow);
  let pose = scenePose(0);
  let pointer = { x: 0, y: 0 };
  let paused = false;
  let disposed = false;
  let aspect = 1;
  let last = -1;
  let previousClock = null;
  let elapsed = 0;
  function resize() {
    const box = canvas.getBoundingClientRect();
    const w = Math.max(1, box.width), h = Math.max(1, box.height);
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    last = -1;
  }
  function update(time = 0) {
    if (disposed || paused) return;
    if (reducedMotion && last >= 0) return;
    if (previousClock !== null) elapsed += Math.min(0.05, Math.max(0, time - previousClock));
    previousClock = time;
    const t = reducedMotion ? 0 : elapsed;
    const drift = t * 0.13;
    assembly.rotation.set(0.18 + pointer.y * 0.12, -0.24 + drift + pose.rotation + pointer.x * 0.18, -0.12 + Math.sin(t * 0.18) * 0.06);
    assembly.position.set(!mobile && aspect > 1.2 ? 1.25 - pose.open * 0.25 : 0, Math.sin(t * 0.6) * 0.055 + pose.open * 0.1, 0);
    const size = mobile ? 0.8 : 0.82;
    assembly.scale.setScalar(size * (1 - pose.open * 0.08));
    rings.forEach(({ group, base }, i) => {
      group.rotation.set(base[0] + pose.open * (i % 2 ? 0.65 : -0.4), base[1] + Math.sin(t * 0.22 + i) * 0.045, base[2] + drift * (i % 2 ? 0.3 : -0.2));
      group.position.set((i - 1.5) * pose.open * 0.75, Math.sin(i * 1.6) * pose.open * 0.55, (i - 1.5) * pose.open * 0.22);
    });
    panels.forEach(({ mesh, angle }, i) => {
      const radius = 2.52 + pose.open * (0.5 + (i % 3) * 0.16);
      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 2 + t * 0.3) * pose.open * 0.7);
    });
    core.rotation.set(t * 0.12, t * -0.16 + pose.open, 0.25);
    camera.position.set(0, 0.2 + pose.open * 0.65, aspect < 0.75 ? 11.5 : pose.distance);
    camera.lookAt(aspect > 1.2 ? 0.25 : 0, 0, 0);
    shadow.position.x = assembly.position.x;
    shadow.material.opacity = 1 - pose.open * 0.6;
    renderer.render(world, camera);
    last = time;
  }
  const contextLost = event => { event.preventDefault(); paused = true; onFailure(); };
  canvas.addEventListener('webglcontextlost', contextLost);
  resize();
  update(0);
  onReady();
  return {
    update,
    setProgress(value) { pose = scenePose(value); last = -1; },
    setPointer(x, y) { pointer = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) }; },
    resize,
    pause() { paused = true; previousClock = null; },
    resume() { paused = false; previousClock = null; last = -1; },
    getState() { return { ...pose, paused }; },
    destroy() {
      disposed = true;
      canvas.removeEventListener('webglcontextlost', contextLost);
      world.traverse(object => {
        object.geometry?.dispose();
        if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
      });
      shadowTexture.dispose(); env.dispose(); renderer.dispose();
    },
  };
}
