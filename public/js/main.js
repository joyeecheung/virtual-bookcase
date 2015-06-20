define('main',
  ['THREE', 'jquery', 'utils', 'bookcase',
   'BlendCharacter', 'OBJMTLLoader'],
function(THREE, $, utils, bookcase) {
var container;
var camera, scene, renderer;
var mainCharacter, guest, hanglight, ground, ceil, walls, chair;
var directionDict = utils.directionDict, direction = utils.direction;
var characterOffset = new THREE.Vector3(40, -90, -80);

var clock = new THREE.Clock();
var conversationText = "Hey!";
var addAnimation = utils.addAnimation,
    addIdleAnimation = utils.addIdleAnimation,
    renderIdleAnimation = utils.renderIdleAnimation;
var getIntersects = utils.getIntersects;
var selectables = [];

var controls = {
  mouse: undefined,
  keyboard: new THREE.Vector3(0, 0, 0),
  windowHalf: new THREE.Vector2(window.innerWidth / 2,
                                window.innerHeight / 2),
  mouseCamera: false
}

function light(scene) {
  var hemiLight = new THREE.HemisphereLight(0xEDDEB6, 0x524A2E, 0.4);
  hemiLight.position.set(50, 300, 80);
  scene.add(hemiLight);

  dirLight = new THREE.DirectionalLight(0xBFB1A2, 1.0);
  dirLight.position.set(50, 110, 80);
  dirLight.target.position.set(50, -70, 300);
  
  scene.add(dirLight);
  // putBox(scene, dirLight.position);
  // putBox(scene, dirLight.target.position);

  pointLight = new THREE.PointLight(0xBFB1A2, 0.5);
  pointLight.position.set(50, 120, 80);
  scene.add(pointLight);

  dirLight.castShadow = true;

  dirLight.shadowMapWidth = 2048;
  dirLight.shadowMapHeight = 2048;

  dirLight.shadowCameraFar = 3500;
  dirLight.shadowBias = -0.0001;
  dirLight.shadowDarkness = 0.35;
}

function animate(time) {
  render(time);
  requestAnimationFrame(animate);
}

function render(currentTime) {
  renderer.render(scene, camera);

  var delta = clock.getDelta();
  utils.renderIdleAnimation(delta);
  THREE.AnimationHandler.update(delta);
}

function init() {
  container = $('#gl-container')[0];
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
  camera.position.z = 650;
  camera.position.y = 30;

  eye = new THREE.Vector3();
  eye.copy(camera.position);
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
  loadGuest(scene);
  loadPainting(scene);
  // loadDoor(scene);

  $.getJSON('/api/books', {limit: 12}, function(books) {
    bookcase.loadBookcase(scene);
    $.each(books, function(i, book) {
      bookcase.loadBook(scene, i, book, function(bookObj) {
        selectables.push(bookObj);
      });
    });

    light(scene);
    addControl(container);
    animate();
  });

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

  var mouseX = e.clientX;
      mouseY = e.clientY;

  if (typeof controls.mouse === "undefined") {
    controls.mouse = new THREE.Vector3();
    controls.mouse.x = mouseX;
    controls.mouse.y = mouseY;
  }

  camera.rotation.y += (controls.mouse.x - mouseX) * 0.01;
  // camera.rotation.x += (controls.mouse.y - mouseY) * 0.01;
  console.log(camera.rotation);
  controls.mouse.x = mouseX;
  controls.mouse.y = mouseY;
}

function moveCameraByKey(e) {
  var key = e.which;
  var keychar = String.fromCharCode(key);
  if (keychar === 'C') {
    if (typeof controls.mouse === "undefined") {
      controls.mouse = new THREE.Vector3();
      controls.mouse.x = mouseX;
      controls.mouse.y = mouseY;
    }
    controls.mouseCamera = !controls.mouseCamera;
  }

  if (key in directionDict && !controls.mouseCamera) {
    characterWalk();
    e.preventDefault();
    var dir = directionDict[key];
    var controlX = direction[dir].x * -0.02,
        controlY = direction[dir].y,
        controlZ = direction[dir].z * 10;

    if (!controls.mouseCamera) {
      if (controlX !== 0) { // rotate
        camera.rotateY(controlX);
        mainCharacter.updateByCamera(camera);
      } else if (controlZ !== 0) {  // move
        camera.translateZ(controlZ);
        mainCharacter.updateByCamera(camera);
      }
    }
    console.log(camera.rotation);
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
    var intersects = getIntersects(e, selectables, renderer, camera);
    if (intersects[0]) {
      $('#gl-container').addClass('in-select');
    } else {
      $('#gl-container').removeClass('in-select');
    }
    bookcase.bookResponse(e, renderer, camera);
  });

  $(document).on('keydown', moveCameraByKey);

  $(document).on('keyup', function() {
    characterStop();
  });

  $(container).on('mousedown', function(e) {
    bookcase.handlBookSelection(e, renderer, camera);
    var intersects = getIntersects(e, [guest], renderer, camera);
    if (intersects[0] && intersects[0].object === guest) {
      guest.rotation.y = -Math.PI;
      conversationPanelIn();
    }
  });

  $('#gl-panel-close').on('click', function(e) {
    if ($('#gl-panel-body').hasClass('book-panel')) {
      var oldUppedBook = controls.uppedBook;
      controls.uppedBook = undefined;
      bookcase.deselectBook(oldUppedBook);
      $('#gl-panel-body').removeClass('book-panel');
    }

    panelOut();
  });

  $('#gl-panel').on('click', '#gl-panel-leave', function(e) {
    panelOut();
    guestLeave();
  });
}

function conversationPanelIn() {
  $('#gl-panel-title').text('Guest');
  var body = $('#gl-panel-body');
  body.html($('#conversation-template').html());
  body.addClass('conversation-panel');
  body.find('#gl-panel-conversation').text(conversationText);
  $('#gl-panel').removeClass('inactive').addClass('active');
}

function panelOut() {
  $('#gl-panel').removeClass('active').addClass('inactive');
  $('#gl-container').removeClass('in-select');
}

function loadCharacter() {
  mainCharacter = new THREE.BlendCharacter();
  mainCharacter.load( "/obj/marine/marine_anims.json", function() {
    scene.add(mainCharacter);
    mainCharacter.play("idle", 1);
    mainCharacter.position.y = characterOffset.y;
    mainCharacter.receiveShadow = true;
    mainCharacter.castShadow = true;
    mainCharacter.scale.set(0.75, 0.75, 0.75);
    mainCharacter.characterOffset = characterOffset;
    mainCharacter.updateByCamera = function(camera) {
      this.position.x = camera.position.x;
      this.translateX(this.characterOffset.x);
      this.position.z = camera.position.z;
      this.translateZ(this.characterOffset.z);
      this.rotation.x = camera.rotation.x;
      this.rotation.y = camera.rotation.y;
      this.rotation.z = camera.rotation.z;
    }
    mainCharacter.updateByCamera(camera);
    addIdleAnimation(function(delta) {
      mainCharacter.update(delta);
    });
  });
}

function guestLeave() {
  guest.stopAll();
  guest.play("run");
  addIdleAnimation(function(delta) {
    guest.update(delta);
    if (guest.position.z < 1500)
      guest.position.z += 5;
  });
}

function loadGuest() {
  guest = new THREE.BlendCharacter();
  var characterOffset = new THREE.Vector3(-120, -90, 80);
  guest.load( "/obj/marine/marine_anims.json", function() {
    guest.castShadow = true;
    guest.receiveShadow = true;
    scene.add(guest);
    guest.play("idle", 1);
    guest.rotation.y = -Math.PI/180 * 145;
    guest.scale.set(0.75, 0.75, 0.75);
    guest.position.copy(characterOffset);
    selectables.push(guest);
    addIdleAnimation(function(delta) {
      guest.update(delta);
    });
  });
}

function loadChair(scene) {
  var loader = new THREE.OBJMTLLoader();

  loader.load('/obj/furniture/fotel.obj', '/obj/furniture/fotel.mtl',
    function(object) {
      chair = utils.smooth(object);
      chair.position.set(-200, -100, 30);
      chair.rotation.y = 0.5;
      utils.castShadow(chair);
      utils.receiveShadow(chair);
      scene.add(chair);
    });
}

// function loadDoor(scene) {
//   var loader = new THREE.OBJMTLLoader();

//   loader.load('/obj/furniture/door1.obj', '/obj/furniture/door1.mtl',
//     function(object) {
//       door = object;
//       door.scale.set(0.7, 0.7, 0.7);
//       door.position.set(190, -100, 150);
//       door.rotation.y = Math.PI/2;
//       object.castShadow = true;
//       object.receiveShadow = true;
//       scene.add(object);
//     });
// }

function loadLight(scene) {
  var loader = new THREE.OBJMTLLoader();
  loader.load('/obj/furniture/hangingLight.obj', '/obj/furniture/hangingLight.mtl',
    function(object) {
      hanglight = utils.smooth(object);
      hanglight.scale.set(0.8, 0.5, 0.8);
      hanglight.position.set(50, 26, 80);
      hanglight.castShadow = true;
      hanglight.receiveShadow = true;
      scene.add(hanglight);
    });
}

function loadPainting(scene) {
  var loader = new THREE.OBJMTLLoader();
  loader.load('/obj/furniture/VaticanMuseumFrame.obj', '/obj/furniture/VaticanMuseumFrame.mtl',
    function(object) {
      object.position.set(120, 70, 0);
      object.castShadow = true;
      object.receiveShadow = true;
      scene.add(object);
    });
}

function loadGround(scene) {
  var groundGeo = new THREE.PlaneBufferGeometry(700, 700);
  var groundMat = utils.imageMaterial('obj/room/paneling.jpg');
  ground = new THREE.Mesh( groundGeo, groundMat );
  ground.rotation.x = -Math.PI/2;
  ground.position.set(0, -90, 130)
  ground.receiveShadow = true;
  scene.add( ground );
}

function loadWalls(scene) {
  var wallGeo = new THREE.PlaneBufferGeometry(700, 250);
  var wallMat = utils.imageMaterial('obj/room/paint2.jpg');

  walls = [];
  function addWall(position, rotY) {
    var wall = new THREE.Mesh(wallGeo, wallMat);
    wall.material.side = THREE.DoubleSide;
    wall.position.copy(position);
    wall.rotation.y = rotY;
    wall.receiveShadow = true;
    scene.add(wall);
    walls.push(wall);
  }
  
  addWall(new THREE.Vector3(0, 35, -20), 0);
  addWall(new THREE.Vector3(-300, 35, 150), Math.PI/2);
  addWall(new THREE.Vector3(300, 35, 150), Math.PI/2);
}

function loadCeiling(scene) {
  var ceilGeo = new THREE.PlaneBufferGeometry(700, 700);
  var ceilMat = utils.imageMaterial('obj/room/paint-rev.jpg');
  ceil = new THREE.Mesh( ceilGeo, ceilMat );
  ceil.material.side = THREE.DoubleSide;
  ceil.position.set(0, 160, 0);
  ceil.rotation.x = -Math.PI/2;
  ceil.receiveShadow = true;
  scene.add(ceil);
}

  return {
    init: init,
    mainCharacter: mainCharacter, 
    guest: guest, 
    hanglight: hanglight, 
    ground: ground, 
    ceil: ceil, 
    walls: walls,
    chair: chair
  };
});