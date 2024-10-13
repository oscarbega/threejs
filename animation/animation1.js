import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js'
import { texture } from "three/webgpu";


let scene, renderer;
let camera;
let objetos = [];
const group = new TWEEN.Group()

init();
animationLoop();

function init() {
  //Defino cámara
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //Objetos
  Cubo(-2.0, 0, 0, 3, 3, 3, 0x00ff00);

  let tomove = objetos[0];

  // Define keyframes y propiedades a interpolar
  const rotationTween = new TWEEN.Tween({ rotation: 0 })
    .to({ rotation:  Math.random()*0.2 }, 500)
    .onUpdate((coords) => {
      tomove.rotateX(coords.rotation);
      tomove.rotateY(coords.rotation)  // Correct rotation method
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(0);

  const tween2 = new TWEEN.Tween({ disScale: 3 })
    .to({ disScale: 0 }, 2000)
    .onUpdate((coords) => {
      tomove.material.displacementScale = coords.disScale;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(0)
    .chain();  // Chain rotationTween to follow tween2

  const tween1 = new TWEEN.Tween({ disScale: 0 })
    .to({ disScale: 3 }, 2000)
    .onUpdate((coords) => {
      tomove.material.displacementScale = coords.disScale;
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .delay(100)
    .chain(rotationTween);  // Chain tween2 to follow tween1

  tween1.start();
  tween2.chain(tween1)
  rotationTween.chain(tween2)
  group.add(tween1);
  group.add(tween2);
  group.add(rotationTween);

}

function Cubo(px, py, pz, sx, sy , sz, col) {
  let geometry = new THREE.SphereGeometry(1,100,100);
  //Material con o sin relleno
  const text = new THREE.TextureLoader()
  const map = text.load('/ammo/noise.jpg')
  const matcap = text.load('/ammo/7877EE_D87FC5_75D9C7_1C78C0.png')
  let material = new THREE.MeshMatcapMaterial({
    //color: 0xff00ff,
    matcap:matcap,
    displacementMap:map,
    displacementScale:3
    //wireframe: true, //Descomenta para activar modelo de alambres
  });

  let mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);
    group.update()

  renderer.render(scene, camera);
}