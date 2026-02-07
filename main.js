// main.js (ES module)
import { setStarBlue } from './starColor.js';

/*
Структура папок:
R136A1/
  index.html
  main.js
  starColor.js
  assets/
    01.jpg ... (скільки треба)
  audio/
    song.mp3
*/

// =====================================================
// MEDIA (ТУТ СПИСОК ТВОЇХ ФОТО)
// =====================================================
const MEDIA_DIR = 'assets/';
const MEDIA_FILES = [
  // Залиш ті, що реально є. Можна 16-18 або будь-яку іншу кількість.
  '01.jpg','02.jpg','03.jpg','04.jpg','05.jpg','06.jpg','07.jpg','08.jpg','09.jpg','10.jpg',
  '11.jpg','12.jpg','13.jpg','14.jpg','15.jpg','16.jpg','17.jpg','18.jpg',
];

// (опціонально) ПІДПИСИ
const CAPTIONS = {
  // '01.jpg': '...',
};

// =====================================================
// MUSIC
// =====================================================
const MUSIC_PATH = 'audio/song.mp3';
const music = new Audio(MUSIC_PATH);
music.loop = true;
music.preload = 'auto';
music.volume = 0;

let musicStarted = false;
let fadeTimer = null;

function fadeTo(target, ms = 900) {
  clearInterval(fadeTimer);
  const steps = 30;
  const stepMs = Math.max(16, Math.floor(ms / steps));
  const start = music.volume;
  const delta = (target - start) / steps;
  let i = 0;

  fadeTimer = setInterval(() => {
    i += 1;
    music.volume = Math.max(0, Math.min(1, start + delta * i));
    if (i >= steps) clearInterval(fadeTimer);
  }, stepMs);
}

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  music.play().catch(() => {
    // якщо браузер не дасть — просто ігноруємо (але після кліку зазвичай дає)
  });
  fadeTo(0.35, 900);
}

function stopMusic() {
  if (!musicStarted) return;
  fadeTo(0.0, 700);
  setTimeout(() => {
    music.pause();
    music.currentTime = 0;
    musicStarted = false;
  }, 750);
}

// =====================================================
// Helpers
// =====================================================
function isImage(file) {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// =====================================================
// Scene / Camera / Renderer
// =====================================================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  4000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

// =====================================================
// Lights
// =====================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const keyLight = new THREE.PointLight(0xffffff, 1.1, 1200);
keyLight.position.set(12, 10, 18);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x88bbff, 0.55, 1200);
rimLight.position.set(-14, -10, 20);
scene.add(rimLight);

// =====================================================
// Textures
// =====================================================
function makeStarTexture(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;

  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.22, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.45)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(c);
}

function makeGlowTextureBlue(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;

  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0.0, 'rgba(120,190,255,0.75)');
  g.addColorStop(0.28, 'rgba(120,190,255,0.32)');
  g.addColorStop(0.60, 'rgba(120,190,255,0.10)');
  g.addColorStop(1.0, 'rgba(120,190,255,0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(c);
}

// =====================================================
// Background stars
// =====================================================
const starTex = makeStarTexture(64);

function makeStarField(count, spread, size, opacity) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    pos[i3]     = (Math.random() - 0.5) * spread;
    pos[i3 + 1] = (Math.random() - 0.5) * spread;
    pos[i3 + 2] = (Math.random() - 0.5) * spread * 1.6;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    map: starTex,
    color: 0xffffff,
    size,
    opacity,
    transparent: true,
    alphaTest: 0.06,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  return new THREE.Points(geo, mat);
}

const starsA = makeStarField(9000, 2200, 0.95, 0.95);
const starsB = makeStarField(1800, 2600, 1.8, 0.85);
scene.add(starsA);
scene.add(starsB);

// =====================================================
// R136A1 star
// =====================================================
const star = new THREE.Mesh(
  new THREE.SphereGeometry(1.45, 72, 72),
  new THREE.MeshStandardMaterial({
    color: 0xaedcff,
    emissive: 0x2b6fb5,
    emissiveIntensity: 1.0,
    roughness: 0.35,
    metalness: 0.0
  })
);

// якщо твій setStarBlue підходить — ок (але не зламає навіть якщо ні)
try {
  setStarBlue(star);
  if (star.material.emissiveIntensity !== undefined) {
    star.material.emissiveIntensity = Math.min(star.material.emissiveIntensity, 1.15);
  }
} catch (_) {}

scene.add(star);

// Halo
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: makeGlowTextureBlue(256),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.85
  })
);
glow.scale.set(10.5, 10.5, 1);
star.add(glow);

// Corona
const corona = new THREE.Mesh(
  new THREE.SphereGeometry(1.75, 48, 48),
  new THREE.MeshBasicMaterial({
    color: 0x7fc6ff,
    transparent: true,
    opacity: 0.10,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
star.add(corona);

// =====================================================
// Camera + states
// =====================================================
const camHome = new THREE.Vector3(0, 0, 42);
const camZoomTarget = new THREE.Vector3(0, 0, 9.5);
camera.position.copy(camHome);

let zooming = false;
let zoomT = 0;      // 0..1
let zoomDone = false;

// =====================================================
// Overlay text
// =====================================================
const overlay = document.getElementById('overlay');
overlay.innerText = 'У кожному всесвіті є щось унікальне';
overlay.style.opacity = 1;

// =====================================================
// Gallery Modal (HTML overlay)
// =====================================================
const modal = document.createElement('div');
modal.id = 'galleryModal';
modal.style.cssText = `
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.70);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(6px);
`;

modal.innerHTML = `
  <div style="
    width: min(980px, 94vw);
    height: min(640px, 82vh);
    background: rgba(12,12,18,0.92);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 18px;
    box-shadow: 0 18px 60px rgba(0,0,0,0.6);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  ">
    <div style="
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      color: white;
      font-family: monospace;
    ">
      <div style="opacity:0.9;">Наші моменти ✨</div>
      <button id="galleryClose" style="
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.10);
        color: white;
        padding: 8px 10px;
        border-radius: 10px;
        cursor: pointer;
      ">Закрити ✕</button>
    </div>

    <div style="
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 0;
      min-height: 0;
    ">
      <div id="viewer" style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.35);
        min-height: 0;
        overflow: hidden;
      "></div>

      <div style="
        border-left: 1px solid rgba(255,255,255,0.08);
        overflow: auto;
        padding: 12px;
        min-height: 0;
      ">
        <div id="thumbs" style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        "></div>
      </div>
    </div>

    <div style="
      padding: 12px 14px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      color: rgba(255,255,255,0.85);
      font-family: monospace;
      font-size: 13px;
    ">
      <div id="caption" style="opacity:0.85;"></div>
      <div>
        <button id="prevBtn" style="margin-right:8px; background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.10); color:white; padding:8px 10px; border-radius:10px; cursor:pointer;">◀</button>
        <button id="nextBtn" style="background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.10); color:white; padding:8px 10px; border-radius:10px; cursor:pointer;">▶</button>
      </div>
    </div>
  </div>
`;
document.body.appendChild(modal);

const viewer = () => document.getElementById('viewer');
const thumbs = () => document.getElementById('thumbs');
const captionEl = () => document.getElementById('caption');

let currentIndex = 0;

function mediaUrl(file) {
  return MEDIA_DIR + file;
}

function setCaption(file) {
  captionEl().textContent = CAPTIONS[file] || '';
}

function showMedia(index) {
  if (!MEDIA_FILES.length) {
    viewer().innerHTML = `<div style="color:white; opacity:0.85; font-family: monospace; padding:20px; text-align:center;">
      Додай файли в <b>MEDIA_FILES</b> у main.js<br/>
      і поклади їх в папку <b>${MEDIA_DIR}</b>
    </div>`;
    captionEl().textContent = '';
    return;
  }

  currentIndex = clamp(index, 0, MEDIA_FILES.length - 1);
  const file = MEDIA_FILES[currentIndex];
  const url = mediaUrl(file);

  viewer().innerHTML = '';

  if (isImage(file)) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = file;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
    `;
    viewer().appendChild(img);
  } else {
    viewer().innerHTML = `<div style="color:white; opacity:0.85; font-family: monospace; padding:20px;">
      Невідомий формат: <b>${file}</b>
    </div>`;
  }

  setCaption(file);
  highlightThumb();
}

function buildThumbs() {
  const t = thumbs();
  t.innerHTML = '';

  if (!MEDIA_FILES.length) {
    t.innerHTML = `<div style="color:white; opacity:0.65; font-family: monospace; grid-column: span 2; padding:6px;">
      Поки пусто. Додай файли в MEDIA_FILES.
    </div>`;
    return;
  }

  MEDIA_FILES.forEach((file, idx) => {
    const url = mediaUrl(file);

    const card = document.createElement('button');
    card.type = 'button';
    card.style.cssText = `
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.06);
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      display: block;
      aspect-ratio: 1 / 1;
      position: relative;
    `;

    if (isImage(file)) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = file;
      img.style.cssText = `width:100%; height:100%; object-fit: cover; display:block;`;
      card.appendChild(img);

      const label = document.createElement('div');
      label.textContent = file;
      label.style.cssText = `
        position:absolute; left:8px; right:8px; bottom:8px;
        color:white; font-family: monospace; font-size:11px; opacity:0.85;
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        text-shadow: 0 2px 8px rgba(0,0,0,0.75);
      `;
      card.appendChild(label);
    } else {
      card.innerHTML = `<div style="color:white; opacity:0.85; font-family: monospace; padding:10px;">${file}</div>`;
    }

    card.addEventListener('click', () => showMedia(idx));
    card.dataset.idx = String(idx);
    t.appendChild(card);
  });

  highlightThumb();
}

function highlightThumb() {
  const t = thumbs();
  const buttons = t.querySelectorAll('button[data-idx]');
  buttons.forEach((b) => {
    const idx = Number(b.dataset.idx);
    b.style.outline = idx === currentIndex ? '2px solid rgba(120,190,255,0.9)' : 'none';
  });
}

function openGallery() {
  startMusic(); // 🎵
  buildThumbs();
  showMedia(currentIndex);
  modal.style.display = 'flex';
  overlay.innerText = '💙';
}

function closeGallery() {
  stopMusic(); // 🎵
  modal.style.display = 'none';
  overlay.innerText = 'У кожному всесвіті є щось унікальне';
}

document.getElementById('galleryClose')?.addEventListener('click', closeGallery);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeGallery();
});

document.getElementById('prevBtn')?.addEventListener('click', () => showMedia(currentIndex - 1));
document.getElementById('nextBtn')?.addEventListener('click', () => showMedia(currentIndex + 1));

window.addEventListener('keydown', (e) => {
  if (modal.style.display === 'flex') {
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') showMedia(currentIndex - 1);
    if (e.key === 'ArrowRight') showMedia(currentIndex + 1);
  }
});

// =====================================================
// Interaction: hover + click + zoom
// =====================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveringStar = false;

function setMouseFromEvent(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', (e) => {
  if (modal.style.display === 'flex') return;
  setMouseFromEvent(e);
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObject(star).length > 0;

  if (hit !== hoveringStar) {
    hoveringStar = hit;
    document.body.style.cursor = hit ? 'pointer' : 'default';
  }
});

window.addEventListener('click', (e) => {
  // якщо модалка відкрита — не ловимо кліки по сцені
  if (modal.style.display === 'flex') return;

  setMouseFromEvent(e);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(star);
  if (!hits.length) return;

  // Перший клік: підліт + старт музики
  if (!zoomDone && !zooming) {
    startMusic();
    zooming = true;
    zoomT = 0;
    overlay.innerText = 'Підлітаю ближче… ✨';
    return;
  }

  // Другий клік: галерея
  if (zoomDone && !zooming) {
    openGallery();
  }
});

// =====================================================
// Resize
// =====================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =====================================================
// Animate
// =====================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // фон
  starsA.rotation.y += 0.00022;
  starsB.rotation.y += 0.00014;
  starsA.rotation.x = Math.sin(t * 0.02) * 0.02;
  starsB.rotation.x = Math.sin(t * 0.015) * 0.012;

  // зірка
  star.rotation.y += 0.0009;

  // пульсація
  const pulse = 1.0 + Math.sin(t * 1.2) * 0.18;
  star.material.emissiveIntensity = pulse;

  // hover підсилює glow
  glow.material.opacity = (hoveringStar ? 0.98 : 0.82) + Math.sin(t * 1.2) * 0.08;
  corona.material.opacity = 0.09 + Math.sin(t * 0.9) * 0.03;

  // zoom
  if (zooming) {
    zoomT += 0.015;
    const k = easeInOutCubic(Math.min(1, zoomT));

    camera.position.lerpVectors(camHome, camZoomTarget, k);

    // приглушуємо фон при наближенні
    starsA.material.opacity = 0.95 - k * 0.35;
    starsB.material.opacity = 0.85 - k * 0.35;

    if (zoomT >= 1) {
      zooming = false;
      zoomDone = true;
      overlay.innerText = 'Натисни ще раз, щоб побачити більше ✨';
    }
  }

  renderer.render(scene, camera);
}
animate();