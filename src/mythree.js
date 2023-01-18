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

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(12, 2, 5);

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

controls.update();
const sound = new THREE.Audio(listener);

// create an Audio source

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/bourgeoisie.mp3', function (buffer) {
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

function makeSquares(num, side) {
  const square = new THREE.Shape();
  square.moveTo(num, num);
  square.lineTo(num, -num);
  square.lineTo(-num, -num);
  square.lineTo(-num, num);

  const geometry = new THREE.ShapeGeometry(square);

  const material = new THREE.MeshBasicMaterial({
    wireframe: true,
    flatshading: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rotationConst = 2.3558;
  const squareMesh = new THREE.Mesh(geometry, material);
  if (side === 'right' || side === 'left') {
    squareMesh.position.x = 0;
    squareMesh.position.y = 0;
    squareMesh.position.z = num;
  }
  if (side === 'top' || side === 'bottom') {
    squareMesh.position.x = 0;
    squareMesh.position.y = num;
    squareMesh.position.z = 0;
    squareMesh.rotation.x = num * rotationConst;
    console.log(squareMesh.rotation);
  }

  if (side === 'front' || side === 'back') {
    squareMesh.position.x = num;
    squareMesh.position.y = 0;
    squareMesh.position.z = 0;
    squareMesh.rotation.y = num * rotationConst;
  }
  scene.add(squareMesh);
  return squareMesh;
}

// keep track of faces
const squareFaces = {
  topSquare: null,
  bottomSquare: null,
  leftSide: null,
  rightSide: null,
  frontSquare: null,
  backSquare: null,
};

// don't change this unless u want to fuck up everything
const faceNum = 6;
squareFaces.rightSide = makeSquares(faceNum, 'right');
squareFaces.leftSide = makeSquares(-faceNum, 'left');

squareFaces.topSquare = makeSquares(faceNum, 'top');
squareFaces.bottomSquare = makeSquares(-faceNum, 'bottom');

squareFaces.frontSquare = makeSquares(faceNum, 'front');
squareFaces.backSquare = makeSquares(-faceNum, 'back');

const shapeArr = [];

function makeSphere(width, height) {
  const geometry = new THREE.SphereGeometry(3, width, height);
  const material = new THREE.MeshNormalMaterial({ wireframe: false });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.geometry.elementsNeedUpdate = true;
  sphere.geometry.verticesNeedUpdate = true;

  return sphere;
}

let pushed = true;

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

//pushToShapeArr();
// console.log(shapeArr.length);
let ind = 0;

const geometry = new THREE.SphereGeometry(5, 2, 3);
const material = new THREE.MeshNormalMaterial({ wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
console.log(THREE);
// const outerGeo = new THREE.BoxGeometry(7, 4, 5);
// const materialGeo = new THREE.MeshNormalMaterial({ wireframe: true });
// const box = new THREE.Mesh(materialGeo, outerGeo);
// scene.add(box);

controls.autoRotate = true;
console.log(scene.children);
function animate() {
  requestAnimationFrame(animate);

  // on a range from 0 - 255
  const avgFreq = analyser.getAverageFrequency(dataArray);
  if ((clicked && pushed) || avgFreq > 0) {
    makeRoughShape(sphere, avgFreq);
    changeBorderBox(squareFaces, avgFreq);
  }
  controls.update();
  renderer.render(scene, camera);
}

function makeRoughShape(mesh, fr) {
  const normalizedFR = (fr * 10) / 255;
  mesh.geometry.vertices.forEach(function (vertex, i) {
    if (clicked) {
      if (normalizedFR > 0) {
        var offset = mesh.geometry.parameters.radius;
        var amp = 1.2;
        var time = window.performance.now();
        var rf = 0.00004;
        vertex.normalize();
        var distance = offset + amp * normalizedFR;
        vertex.multiplyScalar(
          distance *
            noise.noise2D(
              vertex.x + time * rf * 7,
              vertex.y + time * rf * 8,
              vertex.z + time * rf * 9
            )
        );
      }
    } else {
      vertex.normalize(2);
    }
  });
  mesh.geometry.verticesNeedUpdate = true;
  mesh.geometry.normalsNeedUpdate = true;
  mesh.geometry.computeVertexNormals();
  mesh.geometry.computeFaceNormals();
}

function changeBorderBox(shapeObj, num) {
  // iterate thru object and remove items at random from the scene then re-add them at the top of this function
  //mesh.geometry.verticesNeedUpdate = true;

  if (scene.children.length < 3) {
    for (const shape in shapeObj) {
      if (!scene.children.some((gs) => gs.uuid === shape.uuid)) {
        scene.add(shapeObj[shape]);
      }
    }
  }

  var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return obj[keys[(keys.length * Math.random()) << 0]];
  };
  const ranNum = Math.round(Math.random() * 2);
  const ind = Math.round(Math.random() * Object.keys(shapeObj).length - 1);
  const rand = randomProperty(shapeObj);

  if (num > 70) {
    scene.remove(rand);
  }
}

animate();
