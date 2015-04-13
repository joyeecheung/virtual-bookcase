var container, stats;

var camera, scene, renderer;

var controls = {
  mouse: new THREE.Vector3(0, 0, 0),
  keyboard: new THREE.Vector3(0, 0, 0),
  windowHalf: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
  mouseCamera: false,
  bookUpDistance: 0,
  bookFrontDistance: 20,
  bookResponseDuration: 400
}

var books = [];
var updates = [];

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

  updates.push({
    func: moveCameraStep,
    startTime: Date.now(),
    duration: 1
  });
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

    updates.push({
      func: keyCamera,
      startTime: Date.now(),
      duration: controls.bookResponseDuration
    });
  }
}

function selectBook(bookObj) {
  bookObj.rotateX(-bookAngle.x);
  function bookUp(rate) {
    bookObj.position.y =
      positions[bookObj.idx][Y] + controls.bookUpDistance * rate;
    bookObj.position.z =
      positions[bookObj.idx][Z] + controls.bookFrontDistance * rate;

  }

  updates.push({
    func: bookUp,
    startTime: Date.now(),
    duration: controls.bookResponseDuration
  });
}

function deselectBook(bookObj) {
  if (!bookObj)
    return;

  bookObj.rotateX(bookAngle.x);
  function bookDown(rate) {
    bookObj.position.y =
      positions[bookObj.idx][Y] + controls.bookUpDistance * (1 - rate);
  
    bookObj.position.z =
      positions[bookObj.idx][Z] + controls.bookFrontDistance * (1 - rate);
  }

  updates.push({
    func: bookDown,
    startTime: Date.now(),
    duration: 600
  });
}

function handlBookSelection(e) {
  var intersects = getIntersects(e, books, renderer, camera);
  if (intersects.length > 0) {
    newUppedBook = intersects[0].object;
    bookPanelIn(newUppedBook.book);
  } else {
    bookPanelOut();
  }
}

function bookResponse(e) {
  var intersects = getIntersects(e, books, renderer, camera);
  var oldUppedBook = controls.uppedBook;

  if (controls.mouseCamera || !$('#gl-panel').hasClass('hidden'))
    return;

  if (intersects.length > 0) {
    newUppedBook = intersects[0].object;
    if (newUppedBook === oldUppedBook)
      return;

    controls.uppedBook = newUppedBook;
    selectBook(newUppedBook);
    $(container).addClass('in-select');
  } else if (oldUppedBook){
    controls.uppedBook = undefined;
    deselectBook(oldUppedBook);
    $(container).removeClass('in-select');
  }
}

function addControl(container) {

  // listeners
  $(container).mousemove(moveCameraByMouse);

  $(container).mousemove(bookResponse);

  $(document).keydown(moveCameraByKey);

  $(container).mousedown(handlBookSelection);

  $('#gl-panel-close').click(function(e) {
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
  for (var i = 0; i < updates.length; ++i) {
    var remaining = updates[i].startTime + updates[i].duration - Date.now();

    if (updates[i].duration === 1 || remaining < 60) {
      var update = updates.splice(i--, 1)[0];
      update.func(1, update.args);
    } else {
      var rate = remaining / updates[i].duration;
      rate = 1 - Math.pow(rate, 3);  //easing formula
      if (rate > 1 || rate < 0) {
        var update = updates.splice(i--, 1)[0];
        update.func(1, update.args);
      } else {
        updates[i].func(rate, updates[i].args);
      }
    }
  }

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
    for (var i = 0, len = books.length; i < len; ++i) {
      loadBook(scene, i, books[i]);
    }

    light(scene);
    renderer = setUpRenderer(container);
    addControl(container);
    animate();
  });

}

$(init);