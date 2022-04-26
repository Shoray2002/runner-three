import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
// import texture loader
const loader = new THREE.TextureLoader();
const pondTexture = loader.load("./pond.jpg");
pondTexture.wrapS = pondTexture.wrapT = THREE.ClampToEdgeWrapping;
const snowTexture = loader.load("./snow.jpg");
const icetop = loader.load("./icetop.jpg");
const wall = loader.load("./wall.jpg");
let dirLight, hemiLight, fire, helper;
let camera,
  scene,
  renderer,
  controls,
  ground,
  cylinder,
  cone,
  hemisphere,
  coneParams,
  groundParams,
  hemisphereParams,
  shapeParams,
  cylinderParams;
let toggleState = true;
let directionState = false;
let timeState = true;
let speed = 1;
const toggle = document.getElementById("toggle");
const direction = document.getElementById("direction");
const day_night = document.getElementById("day-night");
const speedVal = document.getElementById("speed");
const zoomVal = document.getElementById("zoom");
init();
animate();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );
  camera.position.set(-400, 300, 200);
  scene = new THREE.Scene();
  coneParams = {
    metalness: 0,
    roughness: 0,
    map: icetop,
    color: 0x94f7ff,
  };
  cylinderParams = {
    metalness: 0.5,
    roughness: 1,
    map: wall,
    color: 0xc0f7ff,
  };
  groundParams = {
    metalness: 0.5,
    roughness: 1,
    map: snowTexture,
    side: THREE.DoubleSide,
    color: 0x94f7ff,
  };
  hemisphereParams = {
    metalness: 0.5,
    roughness: 1,
    map: wall,
    color: 0x94f7ff,
  };
  shapeParams = {
    color: 0xe3fdff,
    map: pondTexture,
    metalness: 0.5,
    roughness: 1,
  };
  hemiLight = new THREE.HemisphereLight(0xd1f7ff, 0x444444);
  hemiLight.position.set(0, 200, 0);
  hemiLight.name = "hemiLight";
  scene.add(hemiLight);

  dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.intensity = 5;
  dirLight.position.set(0, 100, 100);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 1000;
  dirLight.shadow.camera.bottom = -1000;
  dirLight.shadow.camera.left = -1000;
  dirLight.shadow.camera.right = 1000;
  dirLight.name = "dirLight";
  dirLight.shadow.mapSize.width = 1024 * 2;
  dirLight.shadow.mapSize.height = 1024 * 2;
  scene.add(dirLight);

  fire = new THREE.PointLight(0xff8000, 5, 300);
  fire.decay = 2;
  fire.power = 100;
  fire.position.set(0, 0, 0);
  fire.castShadow = true;
  fire.name = "fire";
  fire.intensity = 0;
  scene.add(fire);

  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshBasicMaterial(groundParams)
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = "ground";
  scene.add(ground);
  const hut = new THREE.Group();
  cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(65, 65, 100, 32),
    new THREE.MeshPhysicalMaterial(cylinderParams)
  );
  cylinder.name = "walls";
  cylinder.translateY(50);
  cylinder.castShadow = true;
  hut.add(cylinder);
  cone = new THREE.Mesh(
    new THREE.ConeGeometry(75, 100, 180),
    new THREE.MeshPhysicalMaterial(coneParams)
  );
  cone.castShadow = true;
  cone.name = "top";
  cone.translateY(150);
  hut.add(cone);
  hut.position.set(0, -2, -150);
  scene.add(hut);
  hemisphere = new THREE.Mesh(
    new THREE.SphereGeometry(100, 180, 180, 0, 2 * Math.PI, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial(hemisphereParams)
  );
  hemisphere.name = "igloo";
  hemisphere.position.set(-200, -2, 20);
  hemisphere.castShadow = true;
  scene.add(hemisphere);
  const x = 0,
    y = 0;

  const shape = new THREE.Shape();

  shape.moveTo(x + 5, y + 5);
  shape.bezierCurveTo(x + 8, y + 8, x + 4, y, x, y);
  shape.bezierCurveTo(x - 2, y, x - 2, y + 7, x - 2, y + 14);
  shape.bezierCurveTo(x - 2, y + 11, x - 3, y + 18.4, x + 8, y + 19);
  shape.bezierCurveTo(x + 20, y + 18.4, x + 20, y + 11, x + 20, y + 7);
  shape.bezierCurveTo(x + 20, y + 7, x + 20, y, x + 10, y);
  shape.bezierCurveTo(x + 7, y, x + 8, y + 5, x + 5, y + 5);

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshPhysicalMaterial(shapeParams);
  const pond = new THREE.Mesh(geometry, material);
  pond.rotation.x = -Math.PI / 2;
  pond.scale.set(18, 18, 18);
  pond.rotateZ(-8.6);
  pond.position.set(40, 2, -50);
  pond.castShadow = true;
  scene.add(pond);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  // renderer.physicallyCorrectLights = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = speed;
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
toggle.addEventListener("click", () => {
  toggleState = !toggleState;
  if (toggleState) {
    controls.autoRotate = true;
  } else {
    controls.autoRotate = false;
  }
});
direction.addEventListener("click", () => {
  directionState = !directionState;
  console.log(directionState);
  if (directionState) {
    controls.autoRotateSpeed = -1 * speed;
  } else {
    controls.autoRotateSpeed = speed;
  }
});
day_night.addEventListener("click", () => {
  if (timeState) {
    dirLight.intensity = 0;
    fire.intensity = 8;
    day_night.innerHTML = "Day";
  } else {
    dirLight.intensity = 5;
    fire.intensity = 0;
    day_night.innerHTML = "Night";
  }
  timeState = !timeState;
});
speedVal.addEventListener("change", (e) => {
  controls.autoRotateSpeed = e.target.value;
  speed = e.target.value;
});
zoomVal.addEventListener("change", (e) => {
  camera.fov = (20 - e.target.value) * 4;
  camera.updateProjectionMatrix();
});

function animate() {
  controls.update();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
