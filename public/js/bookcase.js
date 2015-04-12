var container, stats;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;
var controlX = 0, controlY = 0, controlZ = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var mouseCamera = false;

var boxes = [];

function loadBook(scene, idx, book) {
  var geometry = new THREE.BoxGeometry(booksize[X], booksize[Y], booksize[Z]);

  function imageMaterial(imgurl) {
    return new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture(imgurl)}
    );
  }

  var materials = [
      imageMaterial('obj/bookcase/bookpages-right.jpg'),  // right
      imageMaterial('obj/bookcase/hard-cover.jpg'),  // left
      imageMaterial('obj/bookcase/bookpages-top.jpg'),  // Top
      imageMaterial('obj/bookcase/bookpages-top.jpg'),  // Bottom
      imageMaterial(book.cover),  // Front
      imageMaterial('obj/bookcase/hard-cover.jpg')   // Back
  ];

  var boxObj = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
  boxObj.position.set.apply(boxObj.position, positions[idx]);
  boxObj.book = book;
  scene.add(boxObj);
  boxes.push(boxObj);
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

function init() {

  container = $('#gl-container')[0];
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
  camera.position.z = 180;

  // scene
  scene = new THREE.Scene();

  loadBookcase(scene);

  $.getJSON('/api/books', function(books) {
    for (var i = 0, len = books.length; i < len; ++i) {
      loadBook(scene, i, books[i]);
    }

    light(scene);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    $(container).append(renderer.domElement);

    addControl(container);

    controlX = camera.position.x;
    controlY = camera.position.y;
    controlZ = camera.position.z;

    animate();
  });

}

function addControl(container) {
  // listeners
  $(container).mousemove(onDocumentMouseMove);

  $(document).keydown(function(e) {
    var key = e.which;
    var keychar = String.fromCharCode(key);
    if (keychar === 'C')
      mouseCamera = !mouseCamera;

    if (key in directionDict) {
      controlX += direction[directionDict[key]].x * 15;
      controlY += direction[directionDict[key]].y * 15;
      controlZ += direction[directionDict[key]].z * 15;
    }
  });

  $(container).mousedown(function(e) {
    e.preventDefault();
    var rect = renderer.domElement.getBoundingClientRect();
    var mouseVector = new THREE.Vector2( 
         ((e.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1, 
         1 - ((e.clientY - rect.top) / renderer.domElement.clientHeight) * 2);

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVector, camera);
    var intersects = raycaster.intersectObjects(boxes);
 
    if ( intersects.length > 0 ) {
        window.open(intersects[0].object.book.url, '_blank');
        window.focus();
    }
  });

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
  } else {
    camera.position.x += (controlX - camera.position.x) * .05;
    camera.position.y += (controlY - camera.position.y) * .05;
    camera.position.z += (controlZ - camera.position.z) * .05;
  }

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

$(init);