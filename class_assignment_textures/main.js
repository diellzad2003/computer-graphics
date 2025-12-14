import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0.8);
heartShape.bezierCurveTo(0, 1.1, -0.4, 1.3, -0.7, 0.9);
heartShape.bezierCurveTo(-1, 0.6, -0.7, -0.1, 0, -0.4);
heartShape.bezierCurveTo(0.7, -0.1, 1, 0.6, 0.7, 0.9);
heartShape.bezierCurveTo(0.4, 1.3, 0, 1.1, 0, 0.8);

const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.05,
    bevelSegments: 5
});

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('textures/images-hearts.png');

texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);

const heartMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.3,
    metalness: 0.2
});

const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
heartMesh.rotation.x = 0;
scene.add(heartMesh);

const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

function animate() {
    requestAnimationFrame(animate);
    heartMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();
