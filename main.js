import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
// import texture loader
const loader = new THREE.TextureLoader();
const pondTexture = loader.load("./pond.jpg");
pondTexture.wrapS = pondTexture.wrapT = THREE.ClampToEdgeWrapping;
const snowTexture = loader.load("./snow.jpg");
const icetop = loader.load("./icetop.jpg");
const wall=loader.load("./wall.jpg");
let camera,
  scene,
  renderer,
  controls,
  ground,
  cylinder,
  cone,
  hemisphere,
  coneParams,
  cylinderParams;
let toggleState = true;
let directionState = false;
let speed = 1;
const toggle = document.getElementById("toggle");
const direction = document.getElementById("direction");
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
    metalness: 0.5,
    roughness: 1,
    normalMap: icetop,
    normalScale: new THREE.Vector2(0.5, 0.5),
    color: 0x6d9ec8,
  };
  cylinderParams = {
    metalness: 0.5,
    roughness: 1,
    normalMap: wall,
    normalScale: new THREE.Vector2(0.5, 0.5),
    color: 0x6d9ec8,

  };
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 200, 0);
  hemiLight.name = "hemiLight";
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.intensity = 0.8;
  dirLight.position.set(0, 200, 100);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 1000;
  dirLight.shadow.camera.bottom = -1000;
  dirLight.shadow.camera.left = -1000;
  dirLight.shadow.camera.right = 1000;
  dirLight.name = "dirLight";
  dirLight.shadow.mapSize.width = 1024 * 2;
  dirLight.shadow.mapSize.height = 1024 * 2;
  scene.add(dirLight);

  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshPhysicalMaterial({
      color: 0x6d9ec8,
      map: snowTexture,
      side: THREE.DoubleSide,
    })
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

  hut.add(cylinder);
  cone = new THREE.Mesh(
    new THREE.ConeGeometry(75, 100, 180),
    new THREE.MeshPhysicalMaterial(coneParams)
  );
  cone.name = "top";
  cone.translateY(150);
  hut.add(cone);

  hut.position.set(0, 0, -100);
  scene.add(hut);
  hemisphere = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({
      color: 0xbbf1f3,
    })
  );
  hemisphere.name = "igloo";
  hemisphere.position.set(-250, 0, 50);
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
  const material = new THREE.MeshBasicMaterial({ map: pondTexture });
  const pond = new THREE.Mesh(geometry, material);
  pond.rotation.x = -Math.PI / 2;
  pond.scale.set(10, 10, 10);
  pond.position.set(-70, 2, 200);
  scene.add(pond);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = speed;
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
