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
// MEDIA
// =====================================================
const MEDIA_DIR = 'assets/';
const MEDIA_FILES = [
  '01.jpg','02.jpg','03.jpg','04.jpg','05.jpg','06.jpg','07.jpg','08.jpg','09.jpg','10.jpg',
  '11.jpg','12.jpg','13.jpg','14.jpg','15.jpg','16.jpg','17.jpg','18.jpg',
];

const CAPTIONS = {
  // '01.jpg': '...',
};

// =====================================================
// POEM
// =====================================================
const POEM_TEXT = `Пробач

Пробач мене, прошу, пробач.
Пробач, що зіпсував фрагмент.
Пробач, що страх узяв наді мною верх
І я зламав той крихітний момент.
Пробач за те, що думаю так мало,
Пробач за скупість і жагу.
Пробач, що знову все втрачаю,
І сам не знаю, як тепер живу.
Пробач, що плачу над дурницями,
Що знов роблю одну вину.
Пробач, що сили залишають,
І я знов падаю в пітьму.
Пробач - це слово тихе й крихке,
Його так легко загубить.
Та я пишу його сьогодні,
Бо сам себе не можу я простить.
І прошу тільки одного -
Щоб ти змогла мене простить.
R136A1, пробач за ці качелі, за мій страх і зламані миті - я все ще кохаю і мрію лише про тебе.`;

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

  music.play().catch(() => {});
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

// iPhone/Safari
renderer.domElement.style.touchAction = 'none';
renderer.domElement.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

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

// трохи теплого світла для золотої зірки
const warmLight = new THREE.PointLight(0xffd39b, 0.45, 1000);
warmLight.position.set(18, 10, 12);
scene.add(warmLight);

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

function makeGlowTextureWarm(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;

  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0.0, 'rgba(255,219,150,0.78)');
  g.addColorStop(0.26, 'rgba(255,219,150,0.34)');
  g.addColorStop(0.60, 'rgba(255,219,150,0.12)');
  g.addColorStop(1.0, 'rgba(255,219,150,0)');

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
    pos[i3] = (Math.random() - 0.5) * spread;
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
// Main star
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

try {
  setStarBlue(star);
  if (star.material.emissiveIntensity !== undefined) {
    star.material.emissiveIntensity = Math.min(star.material.emissiveIntensity, 1.15);
  }
} catch (_) {}

scene.add(star);

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
// Small warm poem star
// =====================================================
const poemStar = new THREE.Mesh(
  new THREE.SphereGeometry(0.48, 56, 56),
  new THREE.MeshStandardMaterial({
    color: 0xffd79a,
    emissive: 0x9b6428,
    emissiveIntensity: 0.85,
    roughness: 0.42,
    metalness: 0.0
  })
);

// праворуч зверху, трохи далі від основної і трохи вглиб
poemStar.position.set(12.8, 7.2, -10.5);
scene.add(poemStar);

const poemGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: makeGlowTextureWarm(256),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.62
  })
);
poemGlow.scale.set(4.8, 4.8, 1);
poemStar.add(poemGlow);

const poemCorona = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0xffd39b,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
poemStar.add(poemCorona);

// =====================================================
// Camera + states
// =====================================================
const camHome = new THREE.Vector3(0, 0, 42);
const camZoomTarget = new THREE.Vector3(0, 0, 9.5);
camera.position.copy(camHome);

let zooming = false;
let zoomT = 0;
let zoomDone = false;

// =====================================================
// Overlay text
// =====================================================
const overlay = document.getElementById('overlay');
overlay.innerText = 'У кожному всесвіті є щось унікальне';
overlay.style.opacity = 1;

// =====================================================
// Gallery Modal
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

// =====================================================
// Poem Modal as a letter
// =====================================================
const poemModal = document.createElement('div');
poemModal.id = 'poemModal';
poemModal.style.cssText = `
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.74);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(7px);
`;

poemModal.innerHTML = `
  <div style="
    width: min(780px, 92vw);
    max-height: 82vh;
    background:
      radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 32%),
      linear-gradient(180deg, #f5e6ca 0%, #edd8b0 100%);
    border: 1px solid rgba(90,60,30,0.18);
    border-radius: 18px;
    box-shadow:
      0 18px 60px rgba(0,0,0,0.45),
      inset 0 1px 0 rgba(255,255,255,0.35);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  ">
    <div style="
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(90,60,30,0.14);
      color: #5b3c23;
      font-family: Georgia, 'Times New Roman', serif;
      background: rgba(255,255,255,0.18);
    ">
      <div style="font-size: 20px; letter-spacing: 0.3px;">Лист</div>
      <button id="poemClose" style="
        background: rgba(91,60,35,0.08);
        border: 1px solid rgba(91,60,35,0.16);
        color: #5b3c23;
        padding: 8px 10px;
        border-radius: 10px;
        cursor: pointer;
        font-family: inherit;
      ">Закрити ✕</button>
    </div>

    <div style="
      padding: 26px 24px 28px;
      overflow: auto;
      position: relative;
    ">
      <div id="poemPaper" style="
        background:
          linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04)),
          repeating-linear-gradient(
            180deg,
            rgba(120,85,45,0.05) 0px,
            rgba(120,85,45,0.05) 1px,
            transparent 1px,
            transparent 34px
          );
        border-radius: 14px;
        padding: 28px 26px;
        color: #4d3421;
        box-shadow: inset 0 0 0 1px rgba(90,60,30,0.08);
      ">
        <div style="
          text-align: center;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 18px;
          opacity: 0.75;
          margin-bottom: 12px;
        ">✦</div>

        <pre id="poemText" style="
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          color: #4d3421;
          font-size: 21px;
          line-height: 1.8;
          font-family: Georgia, 'Times New Roman', serif;
          text-align: left;
        "></pre>
      </div>
    </div>
  </div>
`;
document.body.appendChild(poemModal);
document.getElementById('poemText').textContent = POEM_TEXT;

// =====================================================
// Gallery logic
// =====================================================
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
  startMusic();
  buildThumbs();
  showMedia(currentIndex);
  modal.style.display = 'flex';
  overlay.innerText = '💙';
}

function closeGallery() {
  stopMusic();
  modal.style.display = 'none';
  overlay.innerText = 'У кожному всесвіті є щось унікальне';
}

function openPoemModal() {
  poemModal.style.display = 'flex';
  overlay.innerText = '✨';
}

function closePoemModal() {
  poemModal.style.display = 'none';
  overlay.innerText = 'У кожному всесвіті є щось унікальне';
}

document.getElementById('galleryClose')?.addEventListener('click', closeGallery);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeGallery();
});

document.getElementById('prevBtn')?.addEventListener('click', () => showMedia(currentIndex - 1));
document.getElementById('nextBtn')?.addEventListener('click', () => showMedia(currentIndex + 1));

document.getElementById('poemClose')?.addEventListener('click', closePoemModal);
poemModal.addEventListener('click', (e) => {
  if (e.target === poemModal) closePoemModal();
});

window.addEventListener('keydown', (e) => {
  if (modal.style.display === 'flex') {
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') showMedia(currentIndex - 1);
    if (e.key === 'ArrowRight') showMedia(currentIndex + 1);
  }

  if (poemModal.style.display === 'flex' && e.key === 'Escape') {
    closePoemModal();
  }
});

// =====================================================
// Interaction
// =====================================================
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveringStar = false;
let hoveringPoemStar = false;

function setPointerFromClientXY(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
}

function isHit(obj) {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(obj, true);
  return hits.length > 0;
}

function handleTap(clientX, clientY) {
  if (modal.style.display === 'flex' || poemModal.style.display === 'flex') return;

  setPointerFromClientXY(clientX, clientY);

  // спочатку маленька зірка
  if (isHit(poemStar)) {
    openPoemModal();
    return;
  }

  // потім головна
  if (!isHit(star)) return;

  if (!zoomDone && !zooming) {
    startMusic();
    zooming = true;
    zoomT = 0;
    overlay.innerText = 'Підлітаю ближче… ✨';
    return;
  }

  if (zoomDone && !zooming) {
    openGallery();
  }
}

renderer.domElement.addEventListener('pointermove', (e) => {
  if (modal.style.display === 'flex' || poemModal.style.display === 'flex') return;

  setPointerFromClientXY(e.clientX, e.clientY);

  const hitMain = isHit(star);
  const hitPoem = isHit(poemStar);

  hoveringStar = hitMain;
  hoveringPoemStar = hitPoem;

  document.body.style.cursor = (hitMain || hitPoem) ? 'pointer' : 'default';
}, { passive: true });

renderer.domElement.addEventListener('pointerup', (e) => {
  handleTap(e.clientX, e.clientY);
}, { passive: true });

renderer.domElement.addEventListener('touchend', (e) => {
  const t = e.changedTouches && e.changedTouches[0];
  if (!t) return;
  handleTap(t.clientX, t.clientY);
}, { passive: true });

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

  // головна зірка
  star.rotation.y += 0.0009;
  const pulse = 1.0 + Math.sin(t * 1.2) * 0.18;
  star.material.emissiveIntensity = pulse;
  glow.material.opacity = (hoveringStar ? 0.98 : 0.82) + Math.sin(t * 1.2) * 0.08;
  corona.material.opacity = 0.09 + Math.sin(t * 0.9) * 0.03;

  // маленька тепла зірка
  poemStar.rotation.y += 0.0011;
  poemStar.material.emissiveIntensity = 0.78 + Math.sin(t * 1.4) * 0.10;
  poemGlow.material.opacity = (hoveringPoemStar ? 0.78 : 0.62) + Math.sin(t * 1.0) * 0.05;
  poemCorona.material.opacity = 0.07 + Math.sin(t * 0.85) * 0.025;

  // zoom
  if (zooming) {
    zoomT += 0.015;
    const k = easeInOutCubic(Math.min(1, zoomT));

    camera.position.lerpVectors(camHome, camZoomTarget, k);

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
