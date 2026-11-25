import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202630);

const largeur = window.innerWidth;
const hauteur = window.innerHeight;

const camera = new THREE.PerspectiveCamera(75, largeur / hauteur, 0.1, 100);
camera.position.z = largeur < hauteur ? 7 : 5;


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(largeur, hauteur);
document.body.appendChild(renderer.domElement);


const geometrie = new THREE.BoxGeometry(1, 1, 1);
const materiau = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometrie, materiau);
cube.position.x = -1.2;
scene.add(cube);


const lumiere = new THREE.HemisphereLight(0xffffff, 0x666666, 2);
scene.add(lumiere);


const loader = new GLTFLoader();

loader.load(
  './Duck.glb',
  function (gltf) {
    const canard = gltf.scene;
    canard.position.x = 1.2;
    scene.add(canard);
  },
  undefined,
  function (erreur) {
    console.error('Impossible de charger Duck.glb', erreur);
  }
);


renderer.setAnimationLoop(function (temps) {
  cube.rotation.x = temps / 2000;
  cube.rotation.y = temps / 1000;
  renderer.render(scene, camera);
});