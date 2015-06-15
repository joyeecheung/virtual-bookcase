var container, stats;
var camera, scene, renderer;
var clock = new THREE.Clock();

var controls = {
  mouse: new THREE.Vector3(0, 0, 0),
  keyboard: new THREE.Vector3(0, 0, 0),
  windowHalf: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
  mouseCamera: false
}

function light(scene) {
  var hemiLight = new THREE.HemisphereLight(0xEDDEB6, 0x524A2E, 0.4);
  hemiLight.position.set(50, 300, 80);
  scene.add(hemiLight);

  dirLight = new THREE.DirectionalLight(0xBFB1A2, 1.0);
  dirLight.position.set(50, 110, 80);
  scene.add(dirLight);
  // putBox(scene, new THREE.Vector3(50, 120, 80));

  var pointLight = new THREE.PointLight(0xBFB1A2, 0.5);
  pointLight.position.set(50, 120, 80);
  scene.add(pointLight);

  dirLight.castShadow = true;

  dirLight.shadowMapWidth = 2048;
  dirLight.shadowMapHeight = 2048;

  dirLight.shadowCameraFar = 3500;
  dirLight.shadowBias = -0.0001;
  dirLight.shadowDarkness = 0.35;
}

function putBox(scene, pos) {
  var geometry = new THREE.BoxGeometry(10, 10, 10);
  var box = new THREE.Mesh(geometry, coloredMaterial(0XA6A6A6));
  box.position.set(pos.x, pos.y, pos.z);
  scene.add(box);
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
    characterWalk();
    e.preventDefault();
    var controlX = direction[directionDict[key]].x * 2,
        controlY = direction[directionDict[key]].y * 2,
        controlZ = direction[directionDict[key]].z * 2;

    // acceleartion here, so duration will affect the final result
    function keyCamera(rate) {
      if (!controls.mouseCamera) {
        eye.x += (controlX) * 0.1;
        eye.y += (controlY) * 0.1;
        eye.z += (controlZ) * 0.1;
      }
    }

    addAnimation(keyCamera, Date.now(), 400);
  }
}

function characterWalk() {
  if (!mainCharacter.isMoving) {
    mainCharacter.isMoving = true;
    mainCharacter.stopAll();
    mainCharacter.play("walk", 1);
  }
}

function characterStop() {
  if (mainCharacter.isMoving) {
    mainCharacter.isMoving = false;
    mainCharacter.stopAll();
    mainCharacter.play("idle", 1);
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

  $(document).on('keyup', function() {
    setTimeout(characterStop, 400);
  });

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
  camera.position.copy(eye);
  camera.rotation.copy(dir);

  renderer.render(scene, camera);

  var delta = clock.getDelta();
  renderIdleAnimation(delta);
  THREE.AnimationHandler.update(delta);
}

function init() {
  container = $('#gl-container')[0];
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
  camera.position.z = 500;
  eye = new THREE.Vector3();
  eye.z = 500;
  dir = new THREE.Vector3();

  renderer = setUpRenderer(container);
  renderer.shadowMapEnabled = true;
  // scene
  scene = new THREE.Scene();

  loadGround(scene);
  loadWalls(scene);
  loadCeiling(scene);
  loadChair(scene);
  loadLight(scene);
  loadCharacter(scene);
  // loadDoor(scene);

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

function loadCharacter() {
  mainCharacter = new THREE.BlendCharacter();
  var characterOffset = new THREE.Vector3(40, -90, -150);
  mainCharacter.load( "/obj/marine/marine_anims.json", function() {
    scene.add(mainCharacter);
    mainCharacter.play("idle", 1);

    mainCharacter.scale.set(0.75, 0.75, 0.75);
    addIdleAnimation(function(delta) {
      mainCharacter.position.copy(camera.position);
      mainCharacter.position.add(characterOffset);
      mainCharacter.rotation.copy(camera.rotation);
      mainCharacter.update(delta);
    });
  });
}

function loadChair(scene) {
  var loader = new THREE.OBJMTLLoader();

  loader.load('/obj/furniture/fotel.obj', '/obj/furniture/fotel.mtl',
    function(object) {
      chair = smooth(object);
      chair.position.set(-140, -100, 30);
      chair.rotation.y = 0.5;
      castShadow(chair);
      chair.castShadow = true;
      chair.receiveShadow = true;
      scene.add(chair);
    });
}

function loadDoor(scene) {
  var loader = new THREE.OBJMTLLoader();

  loader.load('/obj/furniture/door1.obj', '/obj/furniture/door1.mtl',
    function(object) {
      door = object;
      door.scale.set(0.7, 0.7, 0.7);
      door.position.set(190, -100, 150);
      door.rotation.y = Math.PI/2;
      object.castShadow = true;
      object.receiveShadow = true;
      scene.add(object);
    });
}

function loadLight(scene) {
  var loader = new THREE.OBJMTLLoader();

  loader.load('/obj/furniture/VaticanMuseumFrame.obj', '/obj/furniture/VaticanMuseumFrame.mtl',
    function(object) {
      object.position.set(120, 70, 0);
      object.castShadow = true;
      object.receiveShadow = true;
      scene.add(object);
    });

  loader.load('/obj/furniture/hangingLight.obj', '/obj/furniture/hangingLight.mtl',
    function(object) {
      hanglight = smooth(object);
      hanglight.scale.set(0.8, 0.5, 0.8);
      hanglight.position.set(50, 30, 80);
      hanglight.castShadow = true;
      hanglight.receiveShadow = true;
      scene.add(hanglight);
    });
}

function loadGround(scene) {
  var groundGeo = new THREE.PlaneBufferGeometry(400, 400);
  var groundMat = imageMaterial('obj/room/paneling.jpg');
  ground = new THREE.Mesh( groundGeo, groundMat );
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -90;
  ground.position.z = 130;
  ground.receiveShadow = true;
  scene.add( ground );
}

function loadWalls(scene) {
  var wallGeo = new THREE.PlaneBufferGeometry(400, 250);
  var wallMat = imageMaterial('obj/room/paint2.jpg');
  wall = new THREE.Mesh( wallGeo, wallMat );
  wall.position.set(0, 35, -20);
  wall.receiveShadow = true;
  scene.add(wall);

  var wall2Geo = new THREE.PlaneBufferGeometry(400, 250);
  var wall2Mat = imageMaterial('obj/room/paint2.jpg');
  wall2 = new THREE.Mesh(wall2Geo, wall2Mat);
  wall2.material.side = THREE.DoubleSide;
  wall2.rotation.y = Math.PI/2;
  wall2.position.set(-190, 35, 150);
  wall2.receiveShadow = true;
  scene.add(wall2);

  var wall3Geo = new THREE.PlaneBufferGeometry(400, 250);
  var wall3Mat = imageMaterial('obj/room/paint2.jpg');
  wall3 = new THREE.Mesh(wall3Geo, wall3Mat);
  wall3.material.side = THREE.DoubleSide;
  wall3.rotation.y = Math.PI/2;
  wall3.position.set(190, 35, 150);
  wall3.receiveShadow = true;
  scene.add(wall3);
}

function loadCeiling(scene) {
  var ceilGeo = new THREE.PlaneBufferGeometry( 500, 500 );
  var ceilMat = imageMaterial('obj/room/paint-rev.jpg');
  ceil = new THREE.Mesh( ceilGeo, ceilMat );
  ceil.material.side = THREE.DoubleSide;
  ceil.rotation.x = -Math.PI/2;
  ceil.position.y = 180;
  ceil.position.z = 0;
  ceil.receiveShadow = true;
  scene.add(ceil);
}

$(init);