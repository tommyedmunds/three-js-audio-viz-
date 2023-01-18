const noise = new SimplexNoise();

const texture = new THREE.TextureLoader().load('assets/mercury.jpeg');
let count = 0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  120,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
//scene.background = texture;

let selectedShape;

let widthSegments = 10;
let heightSegments = 1;

let widthLimit = 13;
let heightLimit = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const geometry = new THREE.SphereGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial();
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

camera.position.z = 5;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1, 0);

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);
controls.update();
const sound = new THREE.Audio(listener);

// create an Audio source

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/jared leto.mp3', function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
});

const analyser = new THREE.AudioAnalyser(sound);
analyser.fftSize = 1024;

function loadAudio() {
  // get the average frequency of the sound
  const data = analyser.getAverageFrequency();
  const bufferLength = analyser.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  return dataArray;
}

const dataArray = loadAudio();
let clicked = false;
document.addEventListener('click', () => {
  if (!clicked) {
    sound.play();
    clicked = true;
  } else {
    sound.pause();
    clicked = false;
  }
});

// controls.autoRotate(true);

const shapeArr = [];

function makeSphere(width, height) {
  const geometry = new THREE.SphereGeometry(3, width, height);
  const material = new THREE.MeshNormalMaterial({ wireframe: true });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.geometry.elementsNeedUpdate = true;
  sphere.geometry.verticesNeedUpdate = true;

  return sphere;
}

let pushed = false;

function pushToShapeArr() {
  if (!pushed) {
    for (let i = widthSegments; i <= widthLimit; i++) {
      for (let e = heightSegments; e <= heightLimit; e++) {
        shapeArr.push(makeSphere(i, e));
      }
    }
    pushed = true;
  }
}

function renderShape(index) {
  if (pushed) {
    if (selectedShape) {
      scene.remove(selectedShape);
    }

    selectedShape = shapeArr[Math.floor(Math.random() * shapeArr.length)];
    scene.add(selectedShape);

    return selectedShape;
  }
}

pushToShapeArr();
// console.log(shapeArr.length);
let ind = 0;

const geometry = new THREE.SphereGeometry(3, 4, 5);
const material = new THREE.MeshNormalMaterial({ wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

function animate() {
  requestAnimationFrame(animate);

  // on a range from 0 - 255

  if (
    (pushed && renderer.info.render.frame === 0) ||
    analyser.getAverageFrequency(dataArray) > 0
  ) {
    makeRoughShape(sphere, analyser.getAverageFrequency(dataArray));
    // if (ind > shapeArr.length - 1) {
    //   scene.remove(selectedShape[selectedShape.length - 1]);
    //   ind = 0;
    // } else {
    //   // const shape = renderShape(ind);

    //   if (clicked) {
    //     // shape.rotation.z += 0.01;
    //     //console.log(shape);
    //     //makeRoughShape(shape, analyser.getAverageFrequency(dataArray));
    //   }
    //   ind += 1;
    // }
  }
  // shape.rotation.y += 0.01;
  // makeRoughShape(shape, analyser.getAverageFrequency(dataArray));

  //selectedShape.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}
//console.log(shape.geometry);
function makeRoughShape(mesh, fr) {
  const normalizedFR = (fr * 10) / 255;
  //console.log(mesh.geometry.vertices);
  let cache;
  mesh.geometry.vertices.forEach(function (vertex, i) {
    if (clicked) {
      if (normalizedFR > 0) {
        var offset = mesh.geometry.parameters.radius;
        var amp = 7;
        var time = window.performance.now();
        var rf = 0.00004;
        vertex.normalize();
        var distance = offset + amp * normalizedFR;
        console.log(
          noise.noise3D(
            vertex.x + time * rf * 7,
            vertex.y + time * rf * 8,
            vertex.z + time * rf * 9
          )
        );
        vertex.multiplyScalar(
          normalizedFR *
            noise.noise3D(
              vertex.x + time * rf * 7,
              vertex.y + time * rf * 8,
              vertex.z + time * rf * 9
            )
        );
      }
    }
  });
  mesh.geometry.verticesNeedUpdate = true;
  // mesh.geometry.normalsNeedUpdate = true;
  // mesh.geometry.computeVertexNormals();
  // mesh.geometry.computeFaceNormals();
}

animate();
