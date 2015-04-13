var container, stats;

var camera, scene, renderer;

var controls = {
  mouse: new THREE.Vector3(0, 0, 0),
  keyboard: new THREE.Vector3(0, 0, 0),
  windowHalf: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
  mouseCamera: false
}

var books = [];
var updates = [];



function init() {
  container = $('#gl-container')[0];
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
  camera.position.z = 180;

  // scene
  scene = new THREE.Scene();
  $.getJSON('/api/books', function(books) {
    loadBookcase(scene);
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
  $(container).mousemove(function(e) {
    if (!controls.mouseCamera)
      return;

    var mouseX = (e.clientX - controls.windowHalf.x) / 2,
        mouseY = (e.clientY - controls.windowHalf.y) / 2

    function mousemoveCamera(rate) {
      if (controls.mouseCamera) {
        camera.position.x += (mouseX - camera.position.x) * .05;
        camera.position.y += (-mouseY - camera.position.y) * .05;
      }
    }

    updates.push({
      func: mousemoveCamera,
      startTime: Date.now(),
      duration: 1
    });
  });

  $(document).keydown(function(e) {
    var key = e.which;
    var keychar = String.fromCharCode(key);
    if (keychar === 'C')
      controls.mouseCamera = !controls.mouseCamera;

    if (key in directionDict && !controls.mouseCamera) {
      e.preventDefault();
      var controlX = direction[directionDict[key]].x * 3,
          controlY = direction[directionDict[key]].y * 3,
          controlZ = direction[directionDict[key]].z * 3;

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
        duration: 600
      });
    }
  });

  $(container).mousedown(function(e) {
    e.preventDefault();
    var intersects = getIntersects(e, books);

    var oldUppedBook = controls.uppedBook;
    var newUppedBook;
    var bookUpDistance = 3;

    if (intersects.length > 0) {
      newUppedBook = intersects[0].object;
      controls.uppedBook = newUppedBook;
    }

    if (newUppedBook && newUppedBook !== oldUppedBook) {
      var upOriginalY = newUppedBook.position.y;
      function bookUp(rate) {
        newUppedBook.position.y = upOriginalY + bookUpDistance * rate;
      }

      updates.push({
        func: bookUp,
        startTime: Date.now(),
        duration: 600
      });

      if (oldUppedBook) {
        var downOriginalY = oldUppedBook.position.y;
        function bookDown(rate) {
          oldUppedBook.position.y = downOriginalY - bookUpDistance * rate;
        }

        updates.push({
          func: bookDown,
          startTime: Date.now(),
          duration: 600
        });
      }

      bookPanelIn(newUppedBook.book);
    } else if (!newUppedBook) {
      if (oldUppedBook) {
        controls.uppedBook = undefined;
        var downOriginalY = oldUppedBook.position.y;
        function bookDown(rate) {
          oldUppedBook.position.y = downOriginalY - bookUpDistance * rate;
        }

        updates.push({
          func: bookDown,
          startTime: Date.now(),
          duration: 600
        });
      }

      bookPanelOut();
    }
  });
}

function getIntersects(e, objects) {
  var rect = renderer.domElement.getBoundingClientRect();
  var mouseVector = new THREE.Vector2( 
       ((e.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1, 
       1 - ((e.clientY - rect.top) / renderer.domElement.clientHeight) * 2);

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouseVector, camera);
  return raycaster.intersectObjects(objects);
}

function bookPanelIn(book) {
  $('#gl-panel-title').text(book.name);
  $('#gl-panel-link')
    .text('Go To Homepage')
    .prop('href', book.url)
    .prop('target', '_blank');
  $('#gl-panel').fadeIn('100');
  $('#gl-panel').removeClass('hidden');
}

function bookPanelOut() {
  $('#gl-panel').fadeOut('100', function() {
    $('#gl-panel').addClass('hidden');
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

$(init);