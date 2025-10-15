import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import GUI from 'lil-gui'

const gui = new GUI()
const scene = new THREE.Scene()

const material = new THREE.MeshStandardMaterial()
material.roughness=0.4
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5,32,32),material
)
sphere.position.x=-1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75,0.75,0.75),material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3,0.2,32,64),material
)
torus.position.x=1.5

const plane=new THREE.Mesh(
    new THREE.PlaneGeometry(5,5),material
)
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.65


scene.add(sphere,cube,torus,plane)

 const ambientLight=new THREE.AmbientLight(0xffffff,1)
 scene.add(ambientLight)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)

const directLight=new THREE.DirectionalLight()
directLight.position.set(1,0.25,0)
scene.add(directLight)

const directLightHelper = new THREE.DirectionalLightHelper(directLight)
scene.add(directLightHelper)

const hemisphereLight=new THREE.HemisphereLight(0xff0000,0x0000ff,0.9)
scene.add(hemisphereLight)

const hemHElper=new THREE.HemisphereLightHelper(hemisphereLight,0.3)
scene.add(hemHElper)

const pintLight=new THREE.PointLight(0xff9000,1.5,0,2)
pintLight.position.set(1,-0.5,1)
scene.add(pintLight)

const pointHElper=new THREE.PointLightHelper(pintLight,0.3)
scene.add(pointHElper)
const sizes={
      width: window.innerWidth,
    height: window.innerHeight
}

const rectArea=new THREE.RectAreaLight(0x4e00ff,6,4,3)
rectArea.position.set(-1.5,0,1.5)
scene.add(rectArea)
const rectHElper=new RectAreaLightHelper(rectArea)
scene.add(rectHElper)
const spotLight=new THREE.SpotLight(0x78ff00,4.5,10,Math.PI*0.1,0.25,1)
scene.add(spotLight)
spotLight.position.set(0,2,3)
spotLight.target.position.x=-0.75
scene.add(spotLight.target)
const spotHelper=new THREE.SpotLightHelper(spotLight)
scene.add(spotHelper)
window.addEventListener('resize',()=>{
    sizes.width=window.innerWidth
    sizes.height=window.innerHeight
Camera.aspect=sizes.width/sizes.height
RenderTarget.setSize(sizes.width,sizes.height)
})
const camera =new THREE.PerspectiveCamera(75,sizes.width/sizes.height,0.1,100)
camera.position.set(1,1,4)
scene.add(camera)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(sizes.width, sizes.height)
document.body.appendChild(renderer.domElement)
function animate(){
    requestAnimationFrame(animate)
    renderer.render(scene,camera)
}
animate()