const texture = new THREE.TextureLoader().load('assets/mercury.jpeg');
let count = 0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  120,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
scene.background = texture;

let widthSegments = 3;
let heightSegments = 12;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const geometry = new THREE.SphereGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial();
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

camera.position.z = 5;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

// const controls = new THREE.DragControls([sphere], camera, renderer.domElement);
// controls.addEventListener('dragstart', function (event) {
//   event.object.material.emissive.set(0xaaaaaa);
// });
// controls.addEventListener('dragend', function (event) {
//   event.object.material.emissive.set(0x000000);
// });

function makeSphere() {
  const geometry = new THREE.SphereGeometry(2, widthSegments, heightSegments);
  const material = new THREE.MeshNormalMaterial({ flatShading: true });
  const sphere = new THREE.Mesh(geometry, material);

  scene.add(sphere);
  sphere.geometry.elementsNeedUpdate = true;
  sphere.geometry.verticesNeedUpdate = true;
  sphere.rotation.x = Math.random() * 600;
  sphere.rotation.y = Math.random() * 600;
  sphere.position.x = getRandomInt(-5, 5);
  sphere.position.y = getRandomInt(-5, 5);
  sphere.position.z = getRandomInt(-5, 2);

  // console.log(sphere.position.x, sphere.position.y);
  return sphere;
}
const shapeArr = [];
for (let i = 0; i <= count; i++) {
  const s = makeSphere();
  console.log('s.geo ', s.geometry);
  shapeArr.push(s);
}
console.log(shapeArr);
function animate() {
  shapeArr.forEach((s) => {
    s.rotation.x += 0.005;
    s.rotation.y += 0.009;
    if (renderer.info.render.frame % 100 === 0) {
      if (s.geometry.parameters.widthSegments > 10) {
        s.geometry.parameters.widthSegments = 1;
      }
      s.geometry.parameters.widthSegments += 1;
    }
  });
  if (renderer.info.render.frame % 100 === 0) {
    // if (s.geometry.parameters.radius > 10) {
    //   s.geometry.parameters.radius = 0;
    // }

    if (count > 10) {
      count = 1;
    }

    // s.geometry.parameters.radius += 1;
    //console.log(renderer.info.render.frame, s.geometry.parameters.radius);
  }

  // if (widthSegments >= 11) {
  //   widthSegments = 2;
  // }

  // if (heightSegments >= 11) {
  //   heightSegments = 4;
  // }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
