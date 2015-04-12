var container, stats;

var camera, scene, renderer;

var mouseX = 0,
  mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var mouseCamera = false;

var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var directionDict = {
  37: "LEFT",
  38: "UP",
  39: "RIGHT",
  40: "DOWN"
}
var direction = {
  LEFT: {
    x: -1,
    y: 0,
    z: 0
  },
  UP: {
    x: 0,
    y: 1
  },
  DOWN: {
    x: 0,
    y: -1
  },
  RIGHT: {
    x: 1,
    y: 0
  } 
}

init();
animate();


function init() {

  container = document.getElementById('gl-container');
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 100;

  // scene

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

  var ambient = new THREE.AmbientLight(0x444444);
  scene.add(ambient);

  var directionalLight = new THREE.DirectionalLight(0xffeedd);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  // model

  var onProgress = function(xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  var onError = function(xhr) {};


  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

  var loader = new THREE.OBJMTLLoader();
  loader.load('/obj/bookcase/pinewoodRackMediumHeight.obj', '/obj/bookcase/pinewoodRackMediumHeight.mtl', function(object) {

    object.position.y = -110;
    object.position.x = -40;
    scene.add(object);

  }, onProgress, onError);

  //

  renderer = new THREE.WebGLRenderer();
  // renderer.setClearColorHex( 0xffffff, 1 );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  
  

  container.appendChild(renderer.domElement);
  container.addEventListener('mousemove', onDocumentMouseMove, false);


  document.addEventListener('keydown', function(e) {
    var key = e.keyCode || e.which;
    var keychar = String.fromCharCode(key);
    console.log(key);
    console.log(keychar);
    if (keychar === 'C')
      mouseCamera = !mouseCamera;


    if (key in directionDict) {
      camera.position.x += direction[directionDict[key]].x * 5;
      camera.position.y += direction[directionDict[key]].y * 5;
    }
  });

  
  //

  // window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);

}

function onDocumentMouseMove(event) {

  mouseX = (event.clientX - windowHalfX) / 2;
  mouseY = (event.clientY - windowHalfY) / 2;

}

//

function animate() {

  requestAnimationFrame(animate);
  render();

}

function render() {

  if (mouseCamera) {
    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;
  }

  camera.lookAt(scene.position);

  renderer.render(scene, camera);

}
