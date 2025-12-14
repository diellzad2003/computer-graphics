import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Helpers
scene.add(new THREE.AxesHelper(10));

// Lights (needed for Standard/Phong materials)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(3, 4, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// Heart shape factory
function createHeartShape() {
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();

  heartShape.moveTo(x + 5, y + 5);
  heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y + 0, x + 0, y + 0);
  heartShape.bezierCurveTo(x - 6, y + 0, x - 6, y + 7, x - 6, y + 7);
  heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y + 0, x + 10, y + 0);
  heartShape.bezierCurveTo(x + 7, y + 0, x + 5, y + 5, x + 5, y + 5);

  return heartShape;
}

// Build a 3D heart mesh (extruded). For flat 2D, swap ExtrudeGeometry -> ShapeGeometry(line commented below)
function createHeartMesh(color = 0xff0000) {
  const shape = createHeartShape();

  const extrudeSettings = {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.12,
    bevelSegments: 2,
    curveSegments: 32
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // If you prefer flat 2D hearts: const geometry = new THREE.ShapeGeometry(shape);

  // Center geometry, then scale down (original path is ~16x19 units)
  geometry.center();
  geometry.scale(0.08, 0.08, 0.08);

  // Use a light-reactive material since we extruded
  const material = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.5 });

  const mesh = new THREE.Mesh(geometry, material);
  // Face the camera: hearts lie in XY plane; a small tilt looks nice
  mesh.rotation.x = -0.2;
  return mesh;
}

// Group with three hearts
const group = new THREE.Group();
scene.add(group);

const heart1 = createHeartMesh(0xff4d4d); // red-ish
heart1.position.x = -3;

const heart2 = createHeartMesh(0x5cff5c); // green-ish
heart2.position.x = 0;

const heart3 = createHeartMesh(0x4d7dff); // blue-ish
heart3.position.x = 3;

group.add(heart1, heart2, heart3);

// Animate
function animate() {
  requestAnimationFrame(animate);
  group.rotation.y += 0.01;
  group.rotation.x += 0.003;
  renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
