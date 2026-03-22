import { setStarBlue } from './starColor.js';

// ==========================
// MEDIA
// ==========================

const MEDIA_DIR = 'assets/';

const MEDIA_FILES = [
'01.jpg','02.jpg','03.jpg','04.jpg','05.jpg','06.jpg','07.jpg','08.jpg','09.jpg','10.jpg',
'11.jpg','12.jpg','13.jpg','14.jpg','15.jpg','16.jpg','17.jpg','18.jpg'
];

// ==========================
// MUSIC
// ==========================

const music = new Audio('audio/song.mp3');

music.loop = true;
music.volume = 0;

let musicStarted = false;

function fadeMusic(target){

const step = (target - music.volume)/30;

const timer = setInterval(()=>{

music.volume += step;

if((step>0 && music.volume>=target)||(step<0 && music.volume<=target)){

music.volume = target;

clearInterval(timer);

}

},30)

}

function startMusic(){

if(musicStarted) return;

musicStarted = true;

music.play().catch(()=>{});

fadeMusic(0.35);

}

function stopMusic(){

if(!musicStarted) return;

fadeMusic(0);

setTimeout(()=>{

music.pause();

music.currentTime = 0;

musicStarted = false;

},700)

}

// ==========================
// THREE
// ==========================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
4000
);

const renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setSize(window.innerWidth,window.innerHeight);

renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

renderer.domElement.style.touchAction = 'none';

document.body.appendChild(renderer.domElement);

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.35;

// ==========================
// LIGHT
// ==========================

scene.add(new THREE.AmbientLight(0xffffff,0.35));

const light1 = new THREE.PointLight(0xffffff,1.1,1200);
light1.position.set(12,10,18);
scene.add(light1);

const light2 = new THREE.PointLight(0x88bbff,0.55,1200);
light2.position.set(-14,-10,20);
scene.add(light2);

// ==========================
// STAR BACKGROUND
// ==========================

function makeStarTexture(size=64){

const c = document.createElement('canvas');
c.width=c.height=size;

const ctx=c.getContext('2d');
const r=size/2;

const g = ctx.createRadialGradient(r,r,0,r,r,r);

g.addColorStop(0,'white');
g.addColorStop(.3,'rgba(255,255,255,.7)');
g.addColorStop(1,'rgba(255,255,255,0)');

ctx.fillStyle=g;
ctx.fillRect(0,0,size,size);

return new THREE.CanvasTexture(c);

}

const starTex = makeStarTexture();

function makeStarField(count,spread,size){

const geo = new THREE.BufferGeometry();
const pos = new Float32Array(count*3);

for(let i=0;i<count;i++){

const i3=i*3;

pos[i3]=(Math.random()-.5)*spread;
pos[i3+1]=(Math.random()-.5)*spread;
pos[i3+2]=(Math.random()-.5)*spread;

}

geo.setAttribute('position',new THREE.BufferAttribute(pos,3));

const mat = new THREE.PointsMaterial({
map:starTex,
color:0xffffff,
size,
transparent:true,
depthWrite:false,
blending:THREE.AdditiveBlending
});

return new THREE.Points(geo,mat);

}

const starsA = makeStarField(9000,2200,1);
const starsB = makeStarField(1800,2600,1.8);

scene.add(starsA);
scene.add(starsB);

// ==========================
// MAIN STAR
// ==========================

const star = new THREE.Mesh(

new THREE.SphereGeometry(1.45,72,72),

new THREE.MeshStandardMaterial({
color:0xaedcff,
emissive:0x2b6fb5,
emissiveIntensity:1,
roughness:.35
})

);

setStarBlue(star);

scene.add(star);

// ==========================
// CAMERA
// ==========================

const camHome = new THREE.Vector3(0,0,42);
const camZoom = new THREE.Vector3(0,0,9.5);

camera.position.copy(camHome);

let zooming=false;
let zoomT=0;
let zoomDone=false;

// ==========================
// OVERLAY
// ==========================

const overlay = document.getElementById("overlay");

overlay.innerText="У кожному всесвіті є щось унікальне";
overlay.style.opacity=1;

// ==========================
// GALLERY
// ==========================

const modal=document.createElement("div");

modal.style.cssText=`
position:fixed;
inset:0;
background:rgba(0,0,0,.8);
display:none;
align-items:center;
justify-content:center;
z-index:9999;
`;

modal.innerHTML=`
<div style="width:90vw;height:80vh;background:#111;border-radius:12px;display:flex;flex-direction:column;">
<div id="viewer" style="flex:1;display:flex;align-items:center;justify-content:center;"></div>
<div style="text-align:center;padding:10px;">
<button id="prevBtn">◀</button>
<button id="nextBtn">▶</button>
<button id="closeBtn">✕</button>
</div>
</div>
`;

document.body.appendChild(modal);

const viewer = () => document.getElementById("viewer");

let currentList=[];
let currentIndex=0;

function showImage(i){

currentIndex=Math.max(0,Math.min(i,currentList.length-1));

viewer().innerHTML="";

const img=document.createElement("img");

img.src=currentList[currentIndex];

img.style.maxWidth="100%";
img.style.maxHeight="100%";

viewer().appendChild(img);

}

function openGallery(){

currentList = MEDIA_FILES.map(f=>MEDIA_DIR+f);

currentIndex=0;

modal.style.display="flex";

showImage(0);

startMusic();

}

function closeGallery(){

modal.style.display="none";

stopMusic();

}

document.addEventListener("click",(e)=>{

if(e.target.id==="prevBtn") showImage(currentIndex-1);
if(e.target.id==="nextBtn") showImage(currentIndex+1);
if(e.target.id==="closeBtn") closeGallery();

});

// ==========================
// INTERACTION
// ==========================

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function setPointer(x,y){

const rect=renderer.domElement.getBoundingClientRect();

pointer.x=((x-rect.left)/rect.width)*2-1;
pointer.y=-((y-rect.top)/rect.height)*2+1;

}

function hit(obj){

raycaster.setFromCamera(pointer,camera);

return raycaster.intersectObject(obj,true).length>0;

}

renderer.domElement.addEventListener("pointerup",(e)=>{

if(modal.style.display==="flex") return;

setPointer(e.clientX,e.clientY);

if(!hit(star)) return;

if(!zoomDone && !zooming){

zooming=true;
zoomT=0;

overlay.innerText="Підлітаю ближче… ✨";

startMusic();

return;

}

if(zoomDone){

openGallery();

}

});

// ==========================
// RESIZE
// ==========================

window.addEventListener("resize",()=>{

camera.aspect=window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth,window.innerHeight);

});

// ==========================
// ANIMATION
// ==========================

const clock = new THREE.Clock();

function animate(){

requestAnimationFrame(animate);

const t=clock.getElapsedTime();

starsA.rotation.y+=0.00022;
starsB.rotation.y+=0.00014;

star.rotation.y+=0.001;

const pulse = 1+Math.sin(t*1.2)*.18;
star.material.emissiveIntensity=pulse;

if(zooming){

zoomT+=0.015;

const k=Math.min(1,zoomT);

camera.position.lerpVectors(camHome,camZoom,k);

if(zoomT>=1){

zooming=false;
zoomDone=true;

overlay.innerText="Натисни ще раз ✨";

}

}

renderer.render(scene,camera);

}

animate();
