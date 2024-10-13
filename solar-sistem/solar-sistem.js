import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { Planet, Star, skyBox } from "./generators";
import { BloomPass } from 'three/examples/jsm/Addons.js';

let activeCam=1;
let speedControl=1

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1,1000)

const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1,1000)
camera2.position.set(0,20,0);
camera2.lookAt(0,0,0);

const camera3 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1,1000)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
renderer.shadowMap.enabled=true
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const Planets = []
const orbitSpeeds=[]
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const sunlight = new THREE.PointLight(0xffffff,50,1000,3)
sunlight.position.set(0,0,0)
sunlight.castShadow=true;
scene.add(sunlight)

document.querySelector('#changeCam').addEventListener('click',(e)=>{
    activeCam = (activeCam+1)%3
    console.log(activeCam)
})
document.querySelector('#changeSpeed').addEventListener('change',(e)=>{
    speedControl = e.target.value/100
    console.log(e.target.value)
})


Star(0.5,50,50,0xffe600,Planets,scene)
orbitSpeeds.push(0.2)
skyBox(scene)
Planet(Planets[0],2,0,0,0.3,20,20, 0xa14e1b0f,Planets,scene)
orbitSpeeds.push(2)
Planet(Planets[0],2.5,0,0,0.15,20,20, 0xadf7ca,Planets,scene)
orbitSpeeds.push(2.5)
Planet(Planets[0],3,0,0,0.3,20,20, 0x142cc9,Planets,scene)
orbitSpeeds.push(1.5)
Planet(Planets[0],5,0,0,0.35,20,20, 0x00ffff0f,Planets,scene)
orbitSpeeds.push(0.5)
Planet(Planets[0],8,0,0,0.4,20,20, 0xe312770f,Planets,scene)
orbitSpeeds.push(1)

const moons=[]
Planet(Planets[4],0.5,0,0,0.10,20,20,0xFFFFFF,moons,scene)
Planet(Planets[1],0.8,0,0,0.05,20,20,0xFFFFFF,moons,scene)

camera.position.z=5
let camControls = new OrbitControls(camera,renderer.domElement)
camControls.update()
camera3.position.z=5
camera3.lookAt(0, 0, 0); 
let cam3Controls = new FlyControls(camera3,renderer.domElement)
cam3Controls.movementSpeed = 0.001;
cam3Controls.domElement = renderer.domElement;
cam3Controls.rollSpeed = 0.001;
cam3Controls.autoForward = false;
cam3Controls.dragToLook = true;
//cam3Controls.update()
const t0 = new Date()


let bloomPass = new UnrealBloomPass( new THREE.Vector2(window.innerWidth/3, window.innerHeight/3), 
1,  // Strength of bloom (intensity)
0.5,  // Radius of bloom
0.03  );
let composer = new EffectComposer(renderer);

function animate() {
    let renderPass = new RenderPass(scene, activeCam === 1 ? camera2 : activeCam === 2 ? camera3 : camera);
    const sunPosition = new THREE.Vector3(0, 0, 0);  // Sun's position at origin

    for (let i = 1; i < Planets.length; i++) {
        const planet = Planets[i];
        const speed = orbitSpeeds[i - 1]*speedControl;  // Get speed for current planet

        // Update planet's orbital position
        const distance = planet.position.distanceTo(sunPosition);  // Radius of orbit
        const angle = speed * Date.now() * 0.001;  // Calculate angle based on time and speed

        planet.position.x = Math.cos(angle) * distance;
        planet.position.z = Math.sin(angle) * distance;

        // Rotate the planet on its own axis
        planet.rotation.y += 0.01;
    }

    for (const planet of Planets) {
        planet.rotation.y += 0.01;
    }

    const t1 = new Date();
    let secs = (t1 - t0) / 1000;
    cam3Controls.update(1 * secs);
    camControls.update();

    // Setup composer with rendering passes

    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // Render the scene based on the active camera
    composer.render();

    // Use requestAnimationFrame just once here
    requestAnimationFrame(animate);
}

//animate()
requestAnimationFrame(animate)
// renderer.setAnimationLoop(animate)