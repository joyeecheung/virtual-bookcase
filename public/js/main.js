var container, stats;
var camera, scene, renderer;

var controls = {
  mouse: new THREE.Vector3(0, 0, 0),
  keyboard: new THREE.Vector3(0, 0, 0),
  windowHalf: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
  mouseCamera: false
}

function light(scene) {
  var ambient = new THREE.AmbientLight(0x444444);
  scene.add(ambient);

  var directionalLight = new THREE.DirectionalLight(0xffeedd);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);
}

function setUpRenderer(container) {
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  $(container).append(renderer.domElement);
  return renderer;
}

function moveCameraByMouse(e) {
  if (!controls.mouseCamera)
    return;

  var mouseX = (e.clientX - controls.windowHalf.x) / 2,
      mouseY = (e.clientY - controls.windowHalf.y) / 2

  function moveCameraStep(rate) {
    if (controls.mouseCamera) {
      camera.position.x += (mouseX - camera.position.x) * .05;
      camera.position.y += (-mouseY - camera.position.y) * .05;
    }
  }

  addAnimation(moveCameraStep, Date.now(), 1);
}

function moveCameraByKey(e) {
  var key = e.which;
  var keychar = String.fromCharCode(key);
  if (keychar === 'C')
    controls.mouseCamera = !controls.mouseCamera;

  if (key in directionDict && !controls.mouseCamera) {
    e.preventDefault();
    var controlX = direction[directionDict[key]].x * 2,
        controlY = direction[directionDict[key]].y * 2,
        controlZ = direction[directionDict[key]].z * 2;

    // acceleartion here, so duration will affect the final result
    function keyCamera(rate) {
      if (!controls.mouseCamera) {
        camera.position.x += (controlX) * rate;
        camera.position.y += (controlY) * rate;
        camera.position.z += (controlZ) * rate;
      }
    }

    addAnimation(keyCamera, Date.now(), 400);
  }
}

function addControl(container) {
  // listeners
  $(container).on('mousemove', moveCameraByMouse);

  $(container).on('mousemove', function(e) {
    if (controls.mouseCamera || !$('#gl-panel').hasClass('inactive'))
      return;
    bookResponse(e);
  });

  $(document).on('keydown', moveCameraByKey);

  $(container).on('mousedown', handlBookSelection);

  $('#gl-panel-close').on('click', function(e) {
    var oldUppedBook = controls.uppedBook;
    controls.uppedBook = undefined;
    deselectBook(oldUppedBook);
    bookPanelOut();
  });
}

function animate(time) {
  render(time);
  requestAnimationFrame(animate);
}

function render(currentTime) {
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

function init() {
  container = $('#gl-container')[0];
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
  camera.position.z = 130;

  // scene
  scene = new THREE.Scene();
  $.getJSON('/api/books', {limit: 12}, function(books) {
    loadBookcase(scene);
    $.each(books, function(i, book) {
      loadBook(scene, i, book);
    });

    light(scene);
    renderer = setUpRenderer(container);
    addControl(container);
    animate();
  });

}

$(init);