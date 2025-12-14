import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f1a);

const container = document.getElementById("scene");
const infoEl = document.getElementById("info");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 200);
camera.position.set(2, 2, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 8, 5);
scene.add(dir);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


const cubes = [];
let lastSelected = null;


for (let i = 0; i < 30; i++) {
  const w = randBetween(0.2, 1.2);
  const h = randBetween(0.2, 1.2);
  const d = randBetween(0.2, 1.2);

  const geometry = new THREE.BoxGeometry(w, h, d);
  const material = new THREE.MeshStandardMaterial({
    color: getRandomColor(),
    metalness: 0.1,
    roughness: 0.7,
  });

  const cube = new THREE.Mesh(geometry, material);

  cube.position.set(
    randBetween(-4, 4),
    randBetween(-3, 3),
    randBetween(-6, 0)
  );

  
  cube.userData.size = { width: w, height: h, depth: d };
  cube.userData.baseColor = material.color.getHex();
  cube.userData.baseScale = cube.scale.clone();

  scene.add(cube);
  cubes.push(cube);
}


window.addEventListener("click", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cubes, false);

  if (hits.length === 0) {
    clearSelection();
    infoEl.textContent = "No object selected. Click a cube to see its information here.";
    return;
  }

  const selected = hits[0].object;
  selectCube(selected);
  updatePanel(selected);
});

function selectCube(cube) {
 
  if (lastSelected && lastSelected !== cube) {
    lastSelected.material.color.setHex(lastSelected.userData.baseColor);
    lastSelected.scale.copy(lastSelected.userData.baseScale);
  }

  
  lastSelected = cube;
  cube.material.color.setHex(0xffffff);

  
  cube.scale.set(
    cube.userData.baseScale.x * 1.15,
    cube.userData.baseScale.y * 1.15,
    cube.userData.baseScale.z * 1.15
  );
}

function clearSelection() {
  if (!lastSelected) return;
  lastSelected.material.color.setHex(lastSelected.userData.baseColor);
  lastSelected.scale.copy(lastSelected.userData.baseScale);
  lastSelected = null;
}

function updatePanel(cube) {
  const p = cube.position;
  const s = cube.userData.size;

  infoEl.innerHTML = `
    <div class="row"><strong>Position</strong>: 
      <code>x=${p.x.toFixed(2)}</code> 
      <code>y=${p.y.toFixed(2)}</code> 
      <code>z=${p.z.toFixed(2)}</code>
    </div>
    <div class="row"><strong>Size</strong>: 
      <code>width=${s.width.toFixed(2)}</code> 
      <code>height=${s.height.toFixed(2)}</code> 
      <code>depth=${s.depth.toFixed(2)}</code>
    </div>
  `;
}


function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h, false);
}
window.addEventListener("resize", resize);
resize();


function animate() {
  controls.update();

  
  if (lastSelected) {
    lastSelected.scale.lerp(lastSelected.userData.baseScale.clone().multiplyScalar(1.15), 0.12);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();


function randBetween(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomColor() {
  return Math.floor(Math.random() * 0xffffff);
}
