import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer();

let controls;
let ambientLight;
let hemiLight;
let directionalLight;
let currentLight = "ambient";

let cubeMesh;

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return '#' + this.object[this.prop].getHexString();
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

function buildScene() {
  const loader = new THREE.CubeTextureLoader();
  loader.crossOrigin = "";
  const skyTexture = loader.load([
    'public/sky.png',
    'public/sky.png',
    'public/sky.png',
    'public/sky.png',
    'public/sky.png',
    'public/sky.png',
  ]);
  scene.background = skyTexture;

  const texLoader = new THREE.TextureLoader();
  texLoader.crossOrigin = "";
  const floorTex = texLoader.load('public/floor.jpg');
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(4, 4);
  floorTex.colorSpace = THREE.SRGBColorSpace;

  const planeSize = 40;
  const floorGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const floorMat = new THREE.MeshPhongMaterial({
    map: floorTex,
    side: THREE.DoubleSide,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = Math.PI * -.5;
  scene.add(floorMesh);

  const cubeSize = 2;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
  cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
  cubeMesh.position.set(0, 6, -15);
  scene.add(cubeMesh);
  generatePedestal(0, 2, -15);

  const dirtTex = texLoader.load('public/dirt.jpg');
  const cubeTxMat = new THREE.MeshPhongMaterial({ map: dirtTex });
  const cubeTxMesh = new THREE.Mesh(cubeGeo, cubeTxMat);
  cubeTxMesh.position.set(-7, 6, -15);
  scene.add(cubeTxMesh);
  generatePedestal(-7, 2, -15);

  const sphereRadius = 2;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.position.set(15, sphereRadius + 5, -15);
  scene.add(sphereMesh);
  generatePedestal(15, 2, -15);

  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();
  mtlLoader.setPath('public/');
  mtlLoader.load('pizza.mtl', (mtl) => {
    mtl.manager.setURLModifier((url) => {
      const filename = url.split('/').pop().split('\\').pop();
      console.log('Loading texture:', filename);
      return 'public/' + filename;
    });
    mtl.preload();
    objLoader.setMaterials(mtl);
    objLoader.setPath('public/');
    objLoader.load('pizza.obj', (root) => {
      root.position.set(7, 7, -15);
      root.rotateX(-30);
      root.rotateY(30);
      scene.add(root);
    });
  });
  generatePedestal(7, 2, -15);

  const coneGeo = new THREE.ConeGeometry( 1, 4, 32 );
  const coneMat = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
  const coneMesh = new THREE.Mesh(coneGeo, coneMat );
  coneMesh.position.set(-15, 7, -15);
  scene.add( coneMesh );
  generatePedestal(-15, 2, -15);

  const pumaTex = texLoader.load('public/puma.jpg');
  const dodGeo = new THREE.DodecahedronGeometry();
  const dodMat = new THREE.MeshPhongMaterial( { map: pumaTex } );
  const dodecahedron = new THREE.Mesh( dodGeo, dodMat );
  dodecahedron.position.set(0, 6, 15);
  scene.add( dodecahedron );
  generatePedestal(0, 2, 15);

  const torGeo = new THREE.TorusGeometry(1, 0.5, 16, 100 );
  const torMat = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
  const torus = new THREE.Mesh( torGeo, torMat );
  torus.position.set(7, 6, 15);
  scene.add( torus );
  generatePedestal(7, 2, 15);

  const tkGeo = new THREE.TorusKnotGeometry( 1, 0.33, 64, 2 );
  const tkMat = new THREE.MeshPhongMaterial( { color: 0xf41e76 } );
  const tk = new THREE.Mesh( tkGeo, tkMat );
  tk.position.set(15, 6, 15);
  scene.add( tk );
  generatePedestal(15, 2, 15);

  const ocGeo = new THREE.OctahedronGeometry();
  const ocMat = new THREE.MeshPhongMaterial( { color: 0x67fe42 } );
  const octahedron = new THREE.Mesh( ocGeo, ocMat );
  octahedron.position.set(-7, 6, 15);
  scene.add( octahedron );
  generatePedestal(-7, 2, 15);

  const capGeo = new THREE.CapsuleGeometry( 1, 1, 4, 8, 1 );
  const capMat = new THREE.MeshBasicMaterial( { color: 0x1337ef } );
  const capsule = new THREE.Mesh( capGeo, capMat );
  capsule.position.set(-15, 6, 15);
  scene.add( capsule );
  generatePedestal(-15, 2, 15);

  const color = 0xFFFFFF;
  const intensity = 1;
  ambientLight = new THREE.AmbientLight(color, intensity);
  hemiLight = new THREE.HemisphereLight(0x87CEFA, 0x808080, intensity);
  directionalLight = new THREE.DirectionalLight(color, intensity);
  directionalLight.position.set(0, 10, 0);
  directionalLight.target.position.set(-5, 0, 0);
  scene.add(ambientLight);
}

function buildGUI() {
  const gui = new GUI();
  const lightParams = {
    lightType: 'ambient',
  };

  const ambientFolder = gui.addFolder('Ambient Light');
  ambientFolder.addColor(new ColorGUIHelper(ambientLight, 'color'), 'value').name('color');
  ambientFolder.add(ambientLight, 'intensity', 0, 5, 0.01);

  const hemiFolder = gui.addFolder('Hemisphere Light');
  hemiFolder.add(hemiLight, 'intensity', 0, 5, 0.01);
  hemiFolder.hide();

  const dirFolder = gui.addFolder('Directional Light');
  dirFolder.addColor(new ColorGUIHelper(directionalLight, 'color'), 'value').name('color');
  dirFolder.add(directionalLight, 'intensity', 0, 5, 0.01);
  dirFolder.add(directionalLight.target.position, 'x', -10, 10);
  dirFolder.add(directionalLight.target.position, 'z', -10, 10);
  dirFolder.add(directionalLight.target.position, 'y', 0, 10);
  dirFolder.hide();

  gui.add(lightParams, 'lightType', ['ambient', 'hemisphere', 'directional']).name('Light Type').onChange((value) => {
    if (value === 'ambient') {
      scene.add(ambientLight);
      scene.remove(hemiLight);
      scene.remove(directionalLight);
      scene.remove(directionalLight.target);
      hemiFolder.hide();
      ambientFolder.show();
      dirFolder.hide();
    } else if (value === 'hemisphere') {
      scene.remove(ambientLight);
      scene.add(hemiLight);
      scene.remove(directionalLight);
      scene.remove(directionalLight.target);
      hemiFolder.show();
      ambientFolder.hide();
      dirFolder.hide();
    } else {
      scene.remove(ambientLight);
      scene.remove(hemiLight);
      scene.add(directionalLight);
      scene.add(directionalLight.target);
      hemiFolder.hide();
      ambientFolder.hide();
      dirFolder.show();
    }
    currentLight = value;
  });
}

const pedGeo = new THREE.CylinderGeometry( 1, 1, 4, 32 );
const pedMat = new THREE.MeshPhongMaterial({ color: 'rgb(253, 255, 159)' });
function generatePedestal(x,y,z) {
  var pedMesh = new THREE.Mesh(pedGeo, pedMat);
  pedMesh.position.set(x,y,z);
  scene.add(pedMesh);
}

function init() {
  const canvasDiv = document.getElementById("canvas-div");
  renderer.setSize(window.innerWidth, window.innerHeight - 200);
  renderer.setAnimationLoop(animate);
  canvasDiv.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 5, 0);

  camera.position.set(0, 5, 10);

  buildScene();
  buildGUI();
}

function animate(time) {
  time *= 0.001;
  cubeMesh.rotation.x = time;
  cubeMesh.rotation.y = time;

  renderer.render(scene, camera);
  controls.update();
}

init();