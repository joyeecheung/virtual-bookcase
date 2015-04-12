var container, stats;

var camera, scene, renderer;

var mouseX = 0,
  mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


init();
animate();


function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

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
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  

  container.appendChild(renderer.domElement);
  document.addEventListener('mousemove', onDocumentMouseMove, false);

  //

  // window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

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

  // camera.position.x += (mouseX - camera.position.x) * .05;
  // camera.position.y += (-mouseY - camera.position.y) * .05;

  camera.lookAt(scene.position);

  renderer.render(scene, camera);

}
