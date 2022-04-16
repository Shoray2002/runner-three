import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

let camera, scene, renderer, plane, plane2, controls, effectComposer;
const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load("/grid-6.png");
const heightTexture = textureLoader.load("/displacement-7.png");
const metalnessTexture = textureLoader.load("/metalness-2.png");
const parameters = {
  displacementScale: 0.4,
  metalness: 1,
  roughness: 0.8,
};
init();
function init() {
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  camera.position.x = 0;
  camera.position.y = 0.06;
  camera.position.z = 1.1;
  console.log(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  const fog = new THREE.Fog("#7e7e7e", 1, 2.5);
  scene.fog = fog;
  scene.add(camera);

  const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
  const material = new THREE.MeshStandardMaterial({
    map: gridTexture,
    displacementMap: heightTexture,
    displacementScale: parameters.displacementScale,
    metalness: parameters.metalness,
    metalnessMap: metalnessTexture,
    roughness: parameters.roughness,
  });

  plane = new THREE.Mesh(geometry, material);
  plane2 = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI * 0.5;
  plane2.rotation.x = -Math.PI * 0.5;

  plane.position.y = 0.0;
  plane.position.z = 0.15;
  plane2.position.y = 0.0;
  plane2.position.z = -1.85;
  scene.add(plane);
  scene.add(plane2);

  const ambientLight = new THREE.AmbientLight("#ffffff", 10);
  scene.add(ambientLight);

  const spotlight = new THREE.SpotLight("#ffffff", 40, 25, Math.PI * 0.1, 0.25);
  spotlight.position.set(0.5, 0.75, 2.1);
  spotlight.target.position.x = -0.25;
  spotlight.target.position.y = 0.25;
  spotlight.target.position.z = 0.25;
  scene.add(spotlight);
  scene.add(spotlight.target);

  const spotlight2 = new THREE.SpotLight(
    "#ffffff",
    40,
    25,
    Math.PI * 0.1,
    0.25
  );
  spotlight2.position.set(-0.5, 0.75, 2.1);
  spotlight2.target.position.x = 0.25;
  spotlight2.target.position.y = 0.25;
  spotlight2.target.position.z = 0.25;
  scene.add(spotlight2);
  scene.add(spotlight2.target);
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".webgl"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  render(0);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI * 0.48;
  effectComposer = new EffectComposer(renderer);
  effectComposer.setSize(window.innerWidth, window.innerHeight);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const renderPass = new RenderPass(scene, camera);
  effectComposer.addPass(renderPass);

  const rgbShiftPass = new ShaderPass(RGBShiftShader);
  rgbShiftPass.uniforms["amount"].value = 0.05;

  effectComposer.addPass(rgbShiftPass);
  const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
  effectComposer.addPass(gammaCorrectionPass);

  var bloomParams = {
    strength: 0.2,
  };

  const bloomPass = new UnrealBloomPass();
  bloomPass.strength = bloomParams.strength;

  effectComposer.addPass(bloomPass);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}
function render() {
  renderer.render(scene, camera);
}

const clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime();
  plane.position.z = (elapsedTime * 0.5) % 2;
  plane2.position.z = ((elapsedTime * 0.5) % 2) - 2;
  window.requestAnimationFrame(animate);
  controls.update();
  effectComposer.render();
  render();
}

animate();
