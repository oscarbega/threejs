import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from '@tweenjs/tween.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

let camera, controls, scene, renderer;
let textureLoader;
const clock = new THREE.Clock();

const mouseCoords = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
console.log("first")
// Mundo físico con Ammo
let physicsWorld;
const gravityConstant = 7.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
let tween

const margin = 0.05; //margen colisiones

// Objetos rígidos
const rigidBodies = [];

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
//Variebles temporales para actualizar transformación en el bucle
let transformAux1;
let tempBtVec3_1;

let pins = []

//Inicialización
Ammo().then(function (AmmoLib) {
    console.log(AmmoLib)
  Ammo = AmmoLib;

  init();
  animationLoop();
});

function init() {
  initGraphics();
  
  initPhysics();
  createObjects();
  initInput();
}

function initGraphics() {
  //Cámara, escena, renderer y control de cámara
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.2,
    2000
  );
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);
  camera.position.set(-12, 2, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, 0);
  controls.update();

  textureLoader = new THREE.TextureLoader();

  //Luces
  const ambientLight = new THREE.AmbientLight(0xffffff,1);
  scene.add(ambientLight);
  bowlingAlley()
  placePins()
  console.log(scene)

  const light = new THREE.DirectionalLight(0xff00ff, 2);
  const light2 = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(0, 10, 0);
  light.rotateX(Math.PI/2)
  light.castShadow = true;
  const d = 14;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.near = 2;
  light.shadow.camera.far = 50;

  light.shadow.mapSize.x = 1024;
  light.shadow.mapSize.y = 1024;

  light2.position.set(-1, 2, 0);
  light2.rotateX(Math.PI/2)
  light2.castShadow = true;

  light2.shadow.camera.left = -d;
  light2.shadow.camera.right = d;
  light2.shadow.camera.top = d;
  light2.shadow.camera.bottom = -d;

  light2.shadow.camera.near = 2;
  light2.shadow.camera.far = 50;

  light2.shadow.mapSize.x = 1024;
  light2.shadow.mapSize.y = 1024;

  scene.add(light);
  scene.add(light2)
  //Redimensión de la ventana
  window.addEventListener("resize", onWindowResize);
}

function initPhysics() {
  // Configuración Ammo
  // Colisiones
  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  // Gestor de colisiones convexas y cóncavas
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  // Colisión fase amplia
  broadphase = new Ammo.btDbvtBroadphase();
  // Resuelve resricciones de reglas físicas como fuerzas, gravedad, etc.
  solver = new Ammo.btSequentialImpulseConstraintSolver();
  // Crea en mundo físico
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  );
  // Establece gravedad
  physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0));

  transformAux1 = new Ammo.btTransform();
  tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
}

//Objeto con posición y orientación especificada con cuaternión
function createObject(mass, halfExtents, pos, quat, material) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(
      halfExtents.x * 2,
      halfExtents.y * 2,
      halfExtents.z * 2
    ),
    material
  );
  object.position.copy(pos);
  object.quaternion.copy(quat);
}

function createObjects() {
  // Suelo
  pos.set(0, -0.5, 0);
  quat.set(0, 0, 0, 1);
//   const suelo = createBoxWithPhysics(
//     2,
//     1,
//     1,
//     0,
//     pos,
//     quat,
//     new THREE.MeshPhongMaterial({ color: 0xffffff })
//   );
//   suelo.receiveShadow = true;
//   textureLoader.load(
//     "https://cdn.glitch.global/8b114fdc-500a-4e05-b3c5-a4afa5246b07/grid.png?v=1669716810074",
//     function (texture) {
//       texture.wrapS = THREE.RepeatWrapping;
//       texture.wrapT = THREE.RepeatWrapping;
//       texture.repeat.set(40, 40);
//       suelo.material.map = texture;
//       suelo.material.needsUpdate = true;
//     }
//   );

  // Muro
  //createWall();
}

function createWall() {
  const brickMass = 0.5;
  const brickLength = 1.2;
  const brickDepth = 0.6;
  const brickHeight = brickLength * 0.5;
  const numBricksLength = 6;
  const numBricksHeight = 8;
  const z0 = -numBricksLength * brickLength * 0.5;
  pos.set(0, brickHeight * 0.5, z0);
  quat.set(0, 0, 0, 1);
  for (let j = 0; j < numBricksHeight; j++) {
    //Varía disposición entre filas pares e impares
    const oddRow = j % 2 == 1;

    pos.z = z0;
    if (oddRow) {
      pos.z -= 0.25 * brickLength;
    }

    const nRow = oddRow ? numBricksLength + 1 : numBricksLength;
    //Compone fila
    for (let i = 0; i < nRow; i++) {
      let brickLengthCurrent = brickLength;
      let brickMassCurrent = brickMass;

      if (oddRow && (i == 0 || i == nRow - 1)) {
        brickLengthCurrent *= 0.5;
        brickMassCurrent *= 0.5;
      }

      const brick = createBoxWithPhysics(
        brickDepth,
        brickHeight,
        brickLengthCurrent,
        brickMassCurrent,
        pos,
        quat,
        createMaterial()
      );
      brick.castShadow = true;
      brick.receiveShadow = true;

      if (oddRow && (i == 0 || i == nRow - 2)) {
        pos.z += 0.75 * brickLength;
      } else {
        pos.z += brickLength;
      }
    }
    pos.y += brickHeight;
  }
}

function bowlingAlley(){
    //Crea la pista de bolos
    const mtlLoader = new MTLLoader()
    mtlLoader.load('/ammo/bowling.mtl', (materials) =>{
        const objLoader = new OBJLoader()
        materials.materials.receiveShadow=true
        objLoader.setMaterials(materials)
        objLoader.load('/ammo/bowling.obj',(obj)=>{
            obj.castShadow=true
            obj.children[0].receiveShadow=true
            scene.add(obj)
            const collision = new Ammo.btBoxShape(
                new Ammo.btVector3(1 * 0.5, 1 * 0.5, 1 * 0.5)
            );
            collision.setMargin(margin)
            pos.set(0,-0.1,0)
            createBoxWithPhysics(15.5,0.1,3,0,pos,quat,new THREE.MeshBasicMaterial({
                opacity:0,
                transparent:true
            }))
        })
    })
}
function bowlingPins(px,py){
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.load('/ammo/bolo.mtl', (materials) =>{
        materials.materials.receiveShadow=true
        materials.materials.castShadow=true
        console.log(materials)
        objLoader.setMaterials(materials)
        
        objLoader.load('/ammo/bolo.obj',(obj)=>{
            obj.rotateX(Math.PI/-2)
            obj.position.set(px,0.1,py)
            obj.scale.set(0.02,0.02,0.02)
            console.log(obj)
            obj.castShadow=true;
            obj.receiveShadow=true;
            obj.children[0].castShadow=true;
            obj.children[0].receiveShadow=true;
            const shape = new Ammo.btBoxShape(
                new Ammo.btVector3(0.1, 0.2,0.2)
              );
            pos.set(px,0.1,py)
            quat.set(-1,0,0,1)
            createRigidBody(obj,shape,20,pos,quat)
            pins.push({
              pin: obj,
              px,
              py
            })
            scene.add(obj)
        })
    })
}
function placePins(){
    bowlingPins(4,0)
    bowlingPins(4.4,0.4)
    bowlingPins(4.4,-0.4)
    bowlingPins(4.8,-0.8)
    bowlingPins(4.8,0.0)
    bowlingPins(4.8,0.8)

}

function createBoxWithPhysics(sx, sy, sz, mass, pos, quat, material) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
    material
  );
  //Estructura geométrica de colisión
  //Crea caja orientada en el espacio, especificando dimensiones
  const shape = new Ammo.btBoxShape(
    new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
  );
  //Margen para colisione
  shape.setMargin(margin);

  createRigidBody(object, shape, mass, pos, quat);

  return object;
}

//Creación de cuerpo rígido, con masa, sujeto a fuerzas, colisiones...
function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
  //Posición
  if (pos) {
    object.position.copy(pos);
  } else {
    pos = object.position;
  }
  //Cuaternión, es decir orientación
  if (quat) {
    object.quaternion.copy(quat);
  } else {
    quat = object.quaternion;
  }
  //Matriz de transformación
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);
  //Inercia inicial y parámetros de rozamiento, velocidad
  const localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);
  //Crea el cuerpo
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    physicsShape,
    localInertia
  );
  const body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(0.5);

  if (vel) {
    body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
  }

  if (angVel) {
    body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
  }

  //Enlaza primitiva gráfica con física
  object.userData.physicsBody = body;
  object.userData.collided = false;

  scene.add(object);
  //Si tiene masa
  if (mass > 0) {
    rigidBodies.push(object);
    // Disable deactivation
    body.setActivationState(4);
  }
  //Añadido al universo físico
  physicsWorld.addRigidBody(body);

  return body;
}

function createRandomColor() {
  return Math.floor(Math.random() * (1 << 24));
}

function createMaterial(color) {
  color = color || createRandomColor();
  return new THREE.MeshPhongMaterial({ color: color });
}

//Evento de ratón
function initInput() {
  window.addEventListener("pointerdown", function (event) {
    //Coordenadas del puntero
    mouseCoords.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouseCoords, camera);

    // Crea bola como cuerpo rígido y la lanza según coordenadas de ratón
    const ballMass = 35;
    const ballRadius = 0.3;
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 14, 10),
      ballMaterial
    );
    ball.castShadow = true;
    ball.receiveShadow = true;
    //Ammo
    //Estructura geométrica de colisión esférica
    const ballShape = new Ammo.btSphereShape(ballRadius);
    ballShape.setMargin(margin);
    pos.copy(raycaster.ray.direction);
    pos.add(raycaster.ray.origin);
    quat.set(0, 0, 0, 1);
    const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);

    pos.copy(raycaster.ray.direction);
    pos.multiplyScalar(10);
    ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animationLoop() {
  requestAnimationFrame(animationLoop);

  const deltaTime = clock.getDelta();
  updatePhysics(deltaTime);

  renderer.render(scene, camera);
}

function updatePhysics(deltaTime) {
  // Avanza la simulación en función del tiempo
  physicsWorld.stepSimulation(deltaTime, 10);

  // Actualiza cuerpos rígidos
  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const objThree = rigidBodies[i];
    const objPhys = objThree.userData.physicsBody;
    //Obtiene posición y rotación
    const ms = objPhys.getMotionState();
    //Actualiza la correspondiente primitiva gráfica asociada
    if (ms) {
      ms.getWorldTransform(transformAux1);
      const p = transformAux1.getOrigin();
      const q = transformAux1.getRotation();
      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

      objThree.userData.collided = false;
    }
  }
}
