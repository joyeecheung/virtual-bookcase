var container, stats;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var mouseCamera = false;

var bookcase = {
  obj: '/obj/bookcase/pinewoodRackMediumHeight.obj',
  mtl: '/obj/bookcase/pinewoodRackMediumHeight.mtl',
  x: -40,
  y: -105,
  z: 0
}

var booksize = [20, 25, 5];

var positions = [[-25, 10, 20], [0, 10, 20], [25, 10, 20],
                 [-25, -22, 20], [0, -22, 20], [25, -22, 20] ]

for (var i = 0, len = positions.length; i < len; ++i) {
  positions[i][0] += bookcase.x + 40;
  positions[i][1] += bookcase.y + 110;
  positions[i][1] += bookcase.z;
}

var boxObj;

function loadBox(scene, pos, cover) {
  var geometry = new THREE.BoxGeometry(20, 25, 5);

  function imageMaterial(imgurl) {
    return new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture(imgurl)}
    );
  }

  var materials = [
      imageMaterial('obj/bookcase/bookpages-right.jpg'),  // right
      imageMaterial('obj/crate/crate.gif'),  // left
      imageMaterial('obj/bookcase/bookpages-top.jpg'),  // Top
      imageMaterial('obj/bookcase/bookpages-top.jpg'),  // Bottom
      imageMaterial('obj/crate/crate.gif'),  // Front
      imageMaterial('obj/crate/crate.gif')   // Back
  ];
   
  // var geometry = new THREE.BoxGeometry(80, 80, 80, 3, 3, 3),
      // cube     = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
   
  // var texture = THREE.ImageUtils.loadTexture(cover);
  // var material = new THREE.MeshBasicMaterial( { map: texture } );

  boxObj = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
  boxObj.position.set.apply(boxObj.position, positions[pos])
  scene.add(boxObj);
}

function loadBookcase(scene) {
  // model
  function onProgress(xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  function onError(xhr) {};

  function objectPosition(object, x, y, z) {
    object.position.y = y || object.position.y;
    object.position.x = x || object.position.x;
    object.position.z = z || object.position.z;
    scene.add(object);
  }

  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

  var loader = new THREE.OBJMTLLoader();
  loader.load(bookcase.obj, bookcase.mtl,
    function(object) {
      objectPosition(object, bookcase.x, bookcase.y, bookcase.z);
    }, onProgress, onError);
}

function light(scene) {
  var ambient = new THREE.AmbientLight(0x444444);
  scene.add(ambient);

  var directionalLight = new THREE.DirectionalLight(0xffeedd);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);
}

function addControl(container) {
  // listeners
  container.addEventListener('mousemove', onDocumentMouseMove, false);

  document.addEventListener('keydown', function(e) {
    var key = e.keyCode || e.which;
    var keychar = String.fromCharCode(key);
    if (keychar === 'C')
      mouseCamera = !mouseCamera;

    if (key in directionDict) {
      camera.position.x += direction[directionDict[key]].x * 5;
      camera.position.y += direction[directionDict[key]].y * 5;
    }
  });
}

function init() {

  container = document.getElementById('gl-container');
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 100;

  // scene
  scene = new THREE.Scene();

  loadBookcase(scene);

  loadBox(scene, 0, '/obj/crate/crate.gif');
  loadBox(scene, 1, '/obj/crate/crate.gif');
  loadBox(scene, 2, '/obj/crate/crate.gif');

  loadBox(scene, 3, '/obj/crate/crate.gif');
  loadBox(scene, 4, '/obj/crate/crate.gif');
  loadBox(scene, 5, '/obj/crate/crate.gif');


  light(scene);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  addControl(container);

  // window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);

}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 2;
  mouseY = (event.clientY - windowHalfY) / 2;
}

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

init();
animate();