var container, stats;
var camera, scene, renderer;

var controls = {
  mouse: new THREE.Vector3(0, 0, 0),
  keyboard: new THREE.Vector3(0, 0, 0),
  windowHalf: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
  mouseCamera: false
}

function light(scene) {
//  var ambient = new THREE.AmbientLight(0x444444);
//  scene.add(ambient);
//
 // var directionalLight = new THREE.DirectionalLight(0xffeedd);
 // directionalLight.position.set(1, 1, 1).normalize();
 // scene.add(directionalLight);

	var hemiLight = new THREE.HemisphereLight(0xEDDEB6, 0x524A2E, 0.3);
	hemiLight.position.set( 0, 500, 0 );
	scene.add( hemiLight );

	var dirLight = new THREE.DirectionalLight(0xffeedd, 0.4);
	dirLight.position.set(1, 1, 1).normalize();
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );

	dirLight.castShadow = true;

	dirLight.shadowMapWidth = 2048;
	dirLight.shadowMapHeight = 2048;

	var d = 50;

	dirLight.shadowCameraLeft = -d;
	dirLight.shadowCameraRight = d;
	dirLight.shadowCameraTop = d;
	dirLight.shadowCameraBottom = -d;

	dirLight.shadowCameraFar = 3500;
	dirLight.shadowBias = -0.0001;
	dirLight.shadowDarkness = 0.35;
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
      dir.x = (-mouseY) * .001;
      dir.y = (-mouseX) * .001;
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
        eye.x += (controlX) * rate;
        eye.y += (controlY) * rate;
        eye.z += (controlZ) * rate;
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
    bookResponse(e, renderer, camera);
  });

  $(document).on('keydown', moveCameraByKey);

  $(container).on('mousedown', function(e) {
    handlBookSelection(e, renderer, camera);
  });

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
  camera.position.x = eye.x;
  camera.position.y = eye.y;
  camera.position.z = eye.z;
  camera.rotation.x = dir.x;
  camera.rotation.y = dir.y;
  camera.rotation.z = dir.z;
  renderer.render(scene, camera);
}

function init() {
  container = $('#gl-container')[0];
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
  camera.position.z = 130;
  eye = new THREE.Vector3();
  eye.z = 130;
  dir = new THREE.Vector3();

  renderer = setUpRenderer(container);
  renderer.shadowMapEnabled = true;
  // scene
  scene = new THREE.Scene();
  var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
  var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
  groundMat.color.setHSL( 0.095, 1, 0.75 );

  var ground = new THREE.Mesh( groundGeo, groundMat );
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -100;
  scene.add( ground );

  ground.receiveShadow = true;

  $.getJSON('/api/books', {limit: 12}, function(books) {
    loadBookcase(scene);
    $.each(books, function(i, book) {
      loadBook(scene, i, book);
    });

    light(scene);
    addControl(container);
    animate();
  });

}

$(init);