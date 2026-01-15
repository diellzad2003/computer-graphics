import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const mount = document.getElementById("app");


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe7ff);

const camera = new THREE.PerspectiveCamera(
  60,
  mount.clientWidth / mount.clientHeight,
  0.1,
  1000
);
camera.position.set(18, 10, 26);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2, -10);


const amb = new THREE.AmbientLight(0xdfefff, 0.35);
scene.add(amb);

const hemi = new THREE.HemisphereLight(0xbcd9ff, 0x7ea66a, 0.55);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(20, 20, 10);
scene.add(dir);

const lamp = new THREE.PointLight(0xffffff, 0.9, 120);
lamp.position.set(-4, 6, -2);
scene.add(lamp);


const C = {
  mint: 0xbfe7e0,
  beige: 0xd7b59a,
  blue: 0x4aa4d9,
  tallBlue: 0x77b5f1,
  roof: 0xe7ecef,
  trunk: 0x6b4f2a,
  leaves: 0x2f6b2f,
};


const textureLoader = new THREE.TextureLoader();

function loadRepeatTexture(url, repeatX, repeatY) {
  const t = textureLoader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  return t;
}

const grassTex = loadRepeatTexture("/textures/grass.jpg", 30, 30);
const roadTex = loadRepeatTexture("/textures/asphalt.jfif", 10, 40);

const brickTex = loadRepeatTexture("/textures/brick.jpg", 4, 2);
const concreteTex = loadRepeatTexture("/textures/concrete.jpg", 3, 2);


const matGrass = new THREE.MeshStandardMaterial({
  map: grassTex,
  roughness: 1.0,
  metalness: 0.0,
});
const matRoad = new THREE.MeshStandardMaterial({
  map: roadTex,
  roughness: 0.95,
  metalness: 0.0,
});
const matRoof = new THREE.MeshStandardMaterial({
  color: C.roof,
  roughness: 0.75,
  metalness: 0.05,
});

const glassMat = new THREE.MeshStandardMaterial({
  color: 0xaec9f4,
  transparent: true,
  opacity: 0.35,
  roughness: 0.05,
  metalness: 0.1,
});

const brickMat = new THREE.MeshStandardMaterial({
  map: brickTex,
  roughness: 0.95,
  metalness: 0.0,
});
const concreteMat = new THREE.MeshStandardMaterial({
  map: concreteTex,
  roughness: 0.98,
  metalness: 0.0,
});

const plainMint = new THREE.MeshStandardMaterial({
  color: C.mint,
  roughness: 0.85,
  metalness: 0.05,
});
const plainBeige = new THREE.MeshStandardMaterial({
  color: C.beige,
  roughness: 0.9,
  metalness: 0.05,
});

const matTrunk = new THREE.MeshLambertMaterial({ color: C.trunk });
const matLeaves = new THREE.MeshLambertMaterial({ color: C.leaves });


const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), matGrass);
grass.rotation.x = -Math.PI / 2;
scene.add(grass);

const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 90), matRoad);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0.002, -8);
scene.add(road);


const unitCube = new THREE.BoxGeometry(1, 1, 1);

function cubeBuilding({ w, h, d, bodyMat, pos, windowsFront = 0, roof = true, tag = "" }) {
  const body = new THREE.Mesh(unitCube, bodyMat);
  body.scale.set(w, h, d);
  body.position.set(pos.x, h / 2, pos.z);
  body.userData.tag = tag;
  body.userData.isBuilding = true;
  scene.add(body);

  if (roof) {
    const r = new THREE.Mesh(unitCube, matRoof);
    r.scale.set(w * 1.02, 0.1, d * 1.02);
    r.position.set(pos.x, h + 0.06, pos.z);
    scene.add(r);
  }

  for (let i = 0; i < windowsFront; i++) {
    const win = new THREE.Mesh(unitCube, glassMat);
    win.scale.set(w * 0.18, h * 0.12, 0.05);
    const x = pos.x - w / 2 + w * 0.2 + i * (w / Math.max(1, windowsFront));
    win.position.set(x, h * 0.6, pos.z + d / 2 + 0.03);
    scene.add(win);
  }

  return body;
}

function externalStairs({ steps = 14, stepW = 2.2, stepH = 0.28, stepD = 0.55, pos, yaw = Math.PI }) {
  const g = new THREE.Group();
  const matStairs = new THREE.MeshLambertMaterial({ color: 0xb9c9e6 });

  for (let i = 0; i < steps; i++) {
    const s = new THREE.Mesh(unitCube, matStairs);
    s.scale.set(stepW, stepH, stepD);
    s.position.set(0, (i + 0.5) * stepH, -(i + 0.5) * stepD);
    g.add(s);
  }
  g.position.copy(pos);
  g.rotation.y = yaw;
  scene.add(g);
  return g;
}

function makeTree({ trunkH = 3.8, trunkR = 0.28, foliageR = 1.4, pos }) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR * 0.8, trunkR, trunkH, 12),
    matTrunk
  );
  trunk.position.set(pos.x, trunkH / 2, pos.z);
  scene.add(trunk);

  const t1 = new THREE.Mesh(new THREE.SphereGeometry(foliageR, 20, 16), matLeaves);
  t1.position.set(pos.x, trunkH - 0.1 + foliageR * 0.2, pos.z);
  scene.add(t1);

  const t2 = new THREE.Mesh(new THREE.SphereGeometry(foliageR * 0.85, 20, 16), matLeaves);
  t2.position.set(pos.x + 0.2, trunkH - 0.7, pos.z - 0.15);
  scene.add(t2);
}


makeTree({ pos: new THREE.Vector3(-3.8, 0, -6) });
makeTree({ pos: new THREE.Vector3(-2.8, 0, -12) });


const leftBuilding = cubeBuilding({
  w: 16,
  h: 3.2,
  d: 6,
  bodyMat: brickMat,
  pos: new THREE.Vector3(-12, 0, -6),
  windowsFront: 4,
  tag: "left",
});

const midBuilding = cubeBuilding({
  w: 8,
  h: 4.2,
  d: 6,
  bodyMat: concreteMat,
  pos: new THREE.Vector3(-2, 0, -18),
  windowsFront: 3,
  tag: "mid",
});

const rightBodyMat = new THREE.MeshStandardMaterial({
  color: C.blue,
  roughness: 0.65,
  metalness: 0.05,
});
cubeBuilding({
  w: 18,
  h: 3.0,
  d: 6.5,
  bodyMat: rightBodyMat,
  pos: new THREE.Vector3(16, 0, -10),
  windowsFront: 6,
  tag: "rightA",
});
cubeBuilding({
  w: 10,
  h: 3.0,
  d: 6.5,
  bodyMat: rightBodyMat,
  pos: new THREE.Vector3(26, 0, -12),
  windowsFront: 3,
  tag: "rightB",
});

cubeBuilding({
  w: 10,
  h: 8,
  d: 8,
  bodyMat: new THREE.MeshStandardMaterial({ color: C.tallBlue }),
  pos: new THREE.Vector3(30, 0, 2),
  tag: "tall",
});
externalStairs({ pos: new THREE.Vector3(35.4, 0, 5.6), yaw: Math.PI });


let campusModel = null;


const status = document.createElement("div");
status.style.cssText =
  "position:fixed;left:10px;bottom:10px;padding:6px 10px;border-radius:8px;" +
  "background:rgba(0,0,0,.6);color:#fff;font:12px system-ui,sans-serif;z-index:9999;";
status.textContent = "GLTF: waiting…";
document.body.appendChild(status);

const setStatus = (msg) => {
  status.textContent = msg;
  console.log(msg);
};


const manager = new THREE.LoadingManager();
manager.onStart = () => setStatus("GLTF: loading…");
manager.onLoad = () => setStatus("GLTF: loaded ✅");
manager.onError = (url) => setStatus("GLTF missing ❌ " + url);


const gltfLoader = new GLTFLoader(manager);
gltfLoader.setPath("/models/periwinkle_plant_4k/");
gltfLoader.setResourcePath("/models/periwinkle_plant_4k/");

gltfLoader.load(
  "periwinkle_plant_4k.gltf",
  (gltf) => {
  setStatus("GLTF: scene received ✅");

  campusModel = gltf.scene;

 
  campusModel.traverse((o) => {
    if (o.isMesh) {
      o.frustumCulled = false; 

      if (o.material) {
        o.material.side = THREE.DoubleSide;

        
        o.material.transparent = false;
        o.material.alphaTest = 0.4;
        o.material.depthWrite = true;
        o.material.needsUpdate = true;
      }
    }
  });

  
  const box = new THREE.Box3().setFromObject(campusModel);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  console.log("PLANT size:", size, "center:", center);

 
  campusModel.position.sub(center);

  
  const maxDim = Math.max(size.x, size.y, size.z);
  const targetSize = 20;          
  const s = targetSize / maxDim;
  campusModel.scale.setScalar(s);

  
  campusModel.position.set(0, 0, 0);

  
  const box2 = new THREE.Box3().setFromObject(campusModel);
  campusModel.position.y += -box2.min.y;

  
  scene.add(new THREE.AxesHelper(10));
  scene.add(new THREE.GridHelper(60, 60));
  scene.add(new THREE.Box3Helper(new THREE.Box3().setFromObject(campusModel), 0xff0000));

  scene.add(campusModel);

 
  controls.target.set(0, 2, 0);
  camera.position.set(15, 10, 15);
  controls.update();

  setStatus("GLTF: added to scene ✅");
}

);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;

const toggleState = { left: true, mid: true };

function setHover(obj, on) {
  if (!obj || !obj.material || !obj.material.emissive) return;
  if (on) {
    obj.userData._oldEmissive = obj.material.emissive.getHex();
    obj.material.emissive.setHex(0x333333);
  } else if (obj.userData._oldEmissive != null) {
    obj.material.emissive.setHex(obj.userData._oldEmissive);
  }
}

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
}
window.addEventListener("pointermove", onPointerMove);

function onClick() {
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  const firstBuilding = hits.find((h) => h.object?.userData?.isBuilding)?.object;
  if (!firstBuilding) return;

  if (firstBuilding.userData.tag === "left") {
    toggleState.left = !toggleState.left;
    leftBuilding.material = toggleState.left ? brickMat : plainMint;
  }

  if (firstBuilding.userData.tag === "mid") {
    toggleState.mid = !toggleState.mid;
    midBuilding.material = toggleState.mid ? concreteMat : plainBeige;
  }
}
window.addEventListener("click", onClick);


let animationsEnabled = true;
let lampEnabled = true;

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "l") {
    lampEnabled = !lampEnabled;
    lamp.visible = lampEnabled;
  }
  if (k === "a") {
    animationsEnabled = !animationsEnabled;
  }
});


const ambInp = document.getElementById("amb");
const hemiInp = document.getElementById("hemi");
const pointInp = document.getElementById("point");

ambInp?.addEventListener("input", () => (amb.intensity = parseFloat(ambInp.value)));
hemiInp?.addEventListener("input", () => (hemi.intensity = parseFloat(hemiInp.value)));
pointInp?.addEventListener("input", () => (lamp.intensity = parseFloat(pointInp.value)));


function onResize() {
  const w = mount.clientWidth;
  const h = mount.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize);


const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  const hitBuilding = hits.find((h) => h.object?.userData?.isBuilding)?.object || null;

  if (hitBuilding !== hovered) {
    setHover(hovered, false);
    hovered = hitBuilding;
    setHover(hovered, true);
  }

  if (animationsEnabled) {
    
    lamp.position.x = -4 + Math.cos(t) * 2.2;
    lamp.position.z = -2 + Math.sin(t) * 2.2;
    lamp.intensity = 0.8 + Math.sin(t * 2.0) * 0.15;

   
    if (campusModel) {
      campusModel.rotation.y += 0.01;
      campusModel.position.y += Math.sin(t * 2.0) * 0.0; 
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();
