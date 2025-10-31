import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const mount = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(mount.clientWidth, mount.clientHeight);
mount.appendChild(renderer.domElement);


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe7ff);

const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
camera.position.set(18, 10, 26);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2, -10);


const amb = new THREE.AmbientLight(0xdfefff, 0.45);     
scene.add(amb);

const hemi = new THREE.HemisphereLight(0xbcd9ff, 0x7ea66a, 0.75); 
scene.add(hemi);

const lamp = new THREE.PointLight(0xffffff, 0.6, 100);
lamp.position.set(-4, 6, -2);
scene.add(lamp);



const C = {
  mint: 0xbfe7e0,
  beige: 0xd7b59a,
  blue: 0x4aa4d9,
  tallBlue: 0x77b5f1,
  grass: 0x2f5a2e,
  path: 0x7a7069,
  roof: 0xe7ecef,
  window: 0xaec9f4,
  trunk: 0x6b4f2a,
  leaves: 0x2f6b2f
};


const mkStandard = (color, extra={}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, ...extra });
const mkPhong    = (color, extra={}) => new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0xdddddd, ...extra });
const mkLambert  = (color, extra={}) => new THREE.MeshLambertMaterial({ color, ...extra });

const matGrass  = mkLambert(C.grass);
const matPath   = mkStandard(C.path, { roughness: 0.95 });
const matRoof   = mkStandard(C.roof, { roughness: 0.7 });
const matWindow = mkStandard(C.window, { roughness: 0.15, metalness: 0.1 });
const matStairs = mkLambert(0xb9c9e6);
const matTrunk  = mkLambert(C.trunk);
const matLeaves = mkLambert(C.leaves);


const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), matGrass);
grass.rotation.x = -Math.PI / 2;
scene.add(grass);

const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 80), matPath);
path.rotation.x = -Math.PI / 2;
path.position.set(0, 0.001, -8);
scene.add(path);


const unitCube = new THREE.BoxGeometry(1, 1, 1);

function cubeBuilding({ w, h, d, bodyMat, pos, windowsFront=0, roof=true }) {
  const body = new THREE.Mesh(unitCube, bodyMat);
  body.scale.set(w, h, d);
  body.position.set(pos.x, h/2, pos.z);
  scene.add(body);

  if (roof) {
    const r = new THREE.Mesh(unitCube, matRoof);
    r.scale.set(w*1.02, 0.1, d*1.02);
    r.position.set(pos.x, h + 0.06, pos.z);
    scene.add(r);
  }

  for (let i=0;i<windowsFront;i++){
    const win = new THREE.Mesh(unitCube, matWindow);
    win.scale.set(w*0.18, h*0.12, 0.05);
    const x = pos.x - (w/2) + (w*0.2) + i*(w/Math.max(1, windowsFront));
    win.position.set(x, h*0.6, pos.z + d/2 + 0.03);
    scene.add(win);
  }
  return body;
}

function externalStairs({ steps=14, stepW=2.2, stepH=0.28, stepD=0.55, pos, yaw=Math.PI }) {
  const g = new THREE.Group();
  for (let i=0;i<steps;i++){
    const s = new THREE.Mesh(unitCube, matStairs);
    s.scale.set(stepW, stepH, stepD);
    s.position.set(0, (i+0.5)*stepH, -(i+0.5)*stepD);
    g.add(s);
  }
  g.position.copy(pos);
  g.rotation.y = yaw;
  scene.add(g);
  return g;
}

function makeTree({ trunkH=3.8, trunkR=0.28, foliageR=1.4, pos }) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkR*0.8, trunkR, trunkH, 12), matTrunk);
  trunk.position.set(pos.x, trunkH/2, pos.z);
  scene.add(trunk);

  const t1 = new THREE.Mesh(new THREE.SphereGeometry(foliageR, 20, 16), matLeaves);
  t1.position.set(pos.x, trunkH - 0.1 + foliageR*0.2, pos.z);
  scene.add(t1);

  const t2 = new THREE.Mesh(new THREE.SphereGeometry(foliageR*0.85, 20, 16), matLeaves);
  t2.position.set(pos.x + 0.2, trunkH - 0.7, pos.z - 0.15);
  scene.add(t2);
}


makeTree({ pos: new THREE.Vector3(-3.8, 0, -6) });
makeTree({ pos: new THREE.Vector3(-2.8, 0, -12) });


let matLeftBody = mkStandard(C.mint);
const leftMint = cubeBuilding({ w:16, h:3.2, d:6, bodyMat: matLeftBody, pos: new THREE.Vector3(-12, 0, -6), windowsFront: 4 });


let matMidBody = mkLambert(C.beige);
const midBeige = cubeBuilding({ w:8, h:4.2, d:6, bodyMat: matMidBody, pos: new THREE.Vector3(-2, 0, -18) });


let matRightBody = mkPhong(C.blue);
cubeBuilding({ w:18, h:3.0, d:6.5, bodyMat: matRightBody, pos: new THREE.Vector3(16, 0, -10), windowsFront: 6 });
cubeBuilding({ w:10, h:3.0, d:6.5, bodyMat: matRightBody, pos: new THREE.Vector3(26, 0, -12), windowsFront: 3 });


const tallBody = cubeBuilding({ w:10, h:8, d:8, bodyMat: mkLambert(C.tallBlue), pos: new THREE.Vector3(30, 0, 2) });
externalStairs({ pos: new THREE.Vector3(35.4, 0, 5.6), yaw: Math.PI });


const ambInp   = document.getElementById('amb');
const hemiInp  = document.getElementById('hemi');
const pointInp = document.getElementById('point');

ambInp.addEventListener('input', () => amb.intensity = parseFloat(ambInp.value));
hemiInp.addEventListener('input', () => hemi.intensity = parseFloat(hemiInp.value));
pointInp.addEventListener('input', () => lamp.intensity = parseFloat(pointInp.value));


const matA = document.getElementById('matA');
const matB = document.getElementById('matB');
const matC = document.getElementById('matC');

function swapMat(which, type) {
  const mk = type === 'phong' ? mkPhong : type === 'lambert' ? mkLambert : mkStandard;
  if (which === 'A') leftMint.material = mk(C.mint);
  if (which === 'B') midBeige.material = mk(C.beige);
  if (which === 'C') {
  
    scene.traverse(o => {
      if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === C.blue) {
        o.material = mk(C.blue);
      }
    });
  }
}

matA.addEventListener('change', e => swapMat('A', e.target.value));
matB.addEventListener('change', e => swapMat('B', e.target.value));
matC.addEventListener('change', e => swapMat('C', e.target.value));


function onResize() {
  const w = mount.clientWidth, h = mount.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
