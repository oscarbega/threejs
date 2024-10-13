import * as THREE from 'three'
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
import { emissive } from 'three/webgpu';
export function Star(radio,nx,ny,col,Objects,scene){
    let geometry = new THREE.SphereGeometry(radio,nx,ny)
    let material= new THREE.MeshStandardMaterial({
        emissive: col,
    })
    let mesh = new THREE.Mesh(geometry,material)
    mesh.position.set(0,0,0)
    scene.add(mesh)
    Objects.push(mesh)
}
export function Planet(parent,px,py,pz,radio,nx,ny,col,Objects,scene){
    let geometry = new THREE.SphereGeometry(radio,nx,ny)
    let material= new THREE.MeshStandardMaterial({
        color: col,
        emissive:new THREE.Color(col).multiplyScalar(0.01)
    })
    let mesh = new THREE.Mesh(geometry,MarsMaterial(col))
    mesh.position.set(px,py,pz)
    mesh.castShadow=true
    mesh.receiveShadow=true
    parent.add(mesh)
    Objects.push(mesh)
}
function MarsMaterial(color){
    const txColor = new THREE.TextureLoader().load('..//galaxy/mars/mars_1k_color.jpg')
    const txnormal = new THREE.TextureLoader().load('..//galaxy/mars/mars_1k_normal.jpg')
    const txBump = new THREE.TextureLoader().load('..//galaxy/mars/marsbump1k.jpg')
    
    const material = new THREE.MeshStandardMaterial({
        color:color,
        emissive:new THREE.Color(color).multiplyScalar(0.005),
        map:txColor,
    })
    //material.emissive = 0xff0000
    material.map = txColor
    material.bumpMap= txBump
    material.normalMap=txnormal;
    return material
}
export function skyBox(scene){
    const ft = new THREE.TextureLoader().load("..//galaxy/space_ft.png"); // Front (+Z)
    const bk = new THREE.TextureLoader().load("..//galaxy/space_bk.png"); // Back (-Z)
    const up = new THREE.TextureLoader().load("..//galaxy/space_up.png"); // Top (+Y)
    const dn = new THREE.TextureLoader().load("..//galaxy/space_dn.png"); // Bottom (-Y)
    const rt = new THREE.TextureLoader().load("..//galaxy/space_rt.png"); // Right (+X)
    const lf = new THREE.TextureLoader().load("..//galaxy/space_lf.png"); // Left (-X)


    const textArray = [ft,bk,up,dn,rt,lf]
    const matArray = textArray.map(text=>{
        return new THREE.MeshBasicMaterial({
            color:0xffffff,
            map:text,
            side:THREE.BackSide
        })
    })

    const skyBoxGeo = new THREE.BoxGeometry(1000,1000,1000);
    const skyBox = new THREE.Mesh(skyBoxGeo,matArray);
    scene.add(skyBox)
}
