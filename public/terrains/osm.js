import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

let scene, renderer, camera;
let mapa, mapsx, mapsy;
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2();
//Latitud y longitud de los extremos del mapa de la imagen
let minlon = -15.56763,  maxlon = -15.34103;
let minlat = 28.05653,  maxlat = 28.19127;
let txwidth, txheight;
let psx, psy;
let paradas = [];
let objetos = [];
let lats = [], longs = [],spots=[], nest;
let hoveredObject = null; // Track the currently hovered object
let originalColor = null; // Store the original color of the object
let entradas=[]
let salidas=[]
let cars = [];
let lastMonth = 0;

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const light = new THREE.AmbientLight(0xffffff,10);
  scene.add(light);
  //Posición de la cámara
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camcontrols1 = new OrbitControls(camera, renderer.domElement);

  //Objeto
  mapsx = 5;
  mapsy = 5;
  Plano(0, 0, 0, mapsx, mapsy);

  //Lectura del archivo csv
  var loader = new THREE.FileLoader();
  loader.load("assets/terrains/aparcamientos_sagulpa_con_coordenadas.csv", function (text) {
    //console.log( text );
    let lines = text.split("\n");
    lines.pop();
    //Cargo archivo con información mde estaciones
    nest = 0;
    for (let line of lines) {
      //No trata primera línea al ser la cabecera
      console.log(line)
      if (nest > 0) {
        //Separo por comas
        let values = line.split(",");
        if(values!=['']){
            //Almaceno nombres de paradas en array
            console.log(values)
            paradas[nest - 1] = values[0];
            //ALmacena localización estaciones
            lats[nest - 1] = Number(values[2]);
            longs[nest - 1] = Number(values[3]);
            spots[nest -1] = Number(values[1])
            entradas[nest-1] = [Number(values[20]),Number(values[18]),Number(values[16]),Number(values[14]),Number(values[12]),Number(values[10]),Number(values[8]),Number(values[6]),Number(values[4])]
            salidas[nest-1] = [Number(values[21].substring(0, values[3].length - 1)),Number(values[19]),Number(values[17]),Number(values[15]),Number(values[13]),Number(values[11]),Number(values[9]),Number(values[7]),Number(values[5])]
        }
      }
      nest += 1;
    }

    //Objeto patra cada estación
    const totalSpots = spots.reduce((acc,curr)=>acc+curr,0)
    const spotPercentages = spots.map(s=>{
      return(s/totalSpots)
    })
    paradas.forEach(myFunction);
    function myFunction(item, index, arr) {
      //longitudes crecen hacia la derecha, como la x
      let mlon = Mapeo(longs[index], minlon, maxlon, -mapsx / 2, mapsx / 2);
      //Latitudes crecen hacia arriba, como la y
      let mlat = Mapeo(lats[index], minlat, maxlat, -mapsy / 2, mapsy / 2);
      console.log(longs)
      console.log(mlon, mlat);
      car(mlon, mlat,spotPercentages[index]);
    }
  });

  //Textura del mapa
  const tx1 = new THREE.TextureLoader().load(
    "assets/terrains/lpMap2.png",

    // Acciones a realizar tras la carga
    function (texture) {

      mapa.material.map = texture;
      mapa.material.needsUpdate = true;

      txwidth = texture.image.width;
      txheight = texture.image.height;

      //Adapta dimensiones del plano a la textura
      if (txheight > txwidth) {
        let factor = txheight / (maxlon - minlon);
        mapa.scale.set(1, factor, 1);
        mapsy *= factor;
      } else {
        let factor = txwidth / txheight;
        mapa.scale.set(factor, 1, 1);
        mapsx *= factor;
      }
    }
  );
}

//valor, rango origen, rango destino
function Mapeo(val, vmin, vmax, dmin, dmax) {
  //Normaliza valor en el rango de partida, t=0 en vmin, t=1 en vmax
  let t = 1 - (vmax - val) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereGeometry(radio, nx, ny);
  let material = new THREE.MeshBasicMaterial({
    color: col,
  });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  objetos.push(mesh);
  scene.add(mesh);
}

function car(px,py,scale,instance){
    const matLoader = new MTLLoader()
    const objLoader = new OBJLoader()
    matLoader.load('assets/terrains/Car-Model/Car.mtl', (materials) => {
      console.log(scale)
      objLoader.setMaterials(materials)
      objLoader.load('assets/terrains/Car-Model/Car.obj',(obj)=>{
        obj.rotateX(Math.PI/2)
        obj.scale.set(0.03*(1+scale*2),0.03*(1+scale*2),0.03*(1+scale*2))
        obj.rotateY(Math.PI/(Math.random()))
        obj.position.set(px,py,0)
        const cubeGeometry =new THREE.BoxGeometry()
        const cubeMesh = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({color:0x00ff00}))
        const cubeMesh2 = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({color:0xff0000}))
        cubeMesh.translateY(2.5)
        cubeMesh.translateZ(1)
        cubeMesh2.translateY(2.5)
        cubeMesh2.translateZ(1)
        cubeMesh2.translateX(1)
        obj.add(cubeMesh)
        obj.add(cubeMesh2)
        cars.push(obj)
        scene.add(obj)
      })
    })
}

function Plano(px, py, pz, sx, sy) {
  let geometry = new THREE.PlaneGeometry(sx, sy);
  let material = new THREE.MeshBasicMaterial({ });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  mapa = mesh;
}
function onPointerMove(event){
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
//Bucle de animación
let lastScale = undefined
window.addEventListener("pointermove",onPointerMove);
document.querySelector("#min").addEventListener('change',(e)=>{
  for (let i  = 0; i < cars.length; i++) {
    const entrada = cars[i].children[1];
    
    entrada.position.setY(2.5);
    const rawValue = entradas[e.target.value-1][i];
    const scalefact = 1 + Math.log10(rawValue + 1)/1;
    entrada.scale.setY(1);
    entrada.translateY((scalefact-1)/2 + 2.5)
    entrada.scale.setY(scalefact)
    

    const salida = cars[i].children[2];
    salida.position.setY(2.5);
    const rawValue2 = salidas[e.target.value-1][i];
    const scalefact2 = 1 + Math.log10(rawValue2 + 1)/1;
    salida.scale.setY(1);
    salida.translateY((scalefact2-1)/2 + 2.5)
    salida.scale.setY(scalefact2)
    console.log(scalefact,scalefact2)
    lastMonth = e.target.value-1
    
    
  }
})
function animate() {
  raycaster.setFromCamera(pointer,camera);
  const intersects = raycaster.intersectObjects(scene.children);
  
  const element = intersects[0]; // Get the first intersected object (the closest one)
  if (element && element.object && element.object.name == "Car_Cube" ) {
    if(!hoveredObject){
      originalColor = element.object.material[0].color.getHex(); // Store original color
    }
    const carIndex = cars.findIndex((c)=>
      c.children[0].id ==element.object.id
    )
    document.querySelector(".entradas").textContent=`Entradas: ${entradas[carIndex][lastMonth]}`
    document.querySelector(".salidas").textContent=`Salidas: ${salidas[carIndex][lastMonth]}`
    console.log(carIndex)
    hoveredObject = element.object;
    // Change the color of the hovered object
    hoveredObject.material[0].color.set(0xff00ff); // Set hover color
  }
  else {
    document.querySelector(".entradas").textContent=``
    document.querySelector(".salidas").textContent=``
    if (hoveredObject) {

      console.log("ohh")
      hoveredObject.material[0].color.set(originalColor);
      hoveredObject = null; // Clear the hover state
    }
  }
  


  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}