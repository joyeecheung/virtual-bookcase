var container, stats;

var camera, scene, renderer;

var controls = {
  mouse: new THREE.Vector3(0, 0, 0),
  keyboard: new THREE.Vector3(0, 0, 0),
  windowHalf: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
  mouseCamera: false
}

var boxes = [];
var updates = [];

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
    });
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
      console.log(rate);
      if (rate > 1 || rate < 0) {
        var update = updates.splice(i--, 1)[0];
        update.func(1, update.args);
      } else {
        updates[i].func(rate, updates[i].args);
      }
    }
  }

  // if (mouseCamera) {
  //   camera.position.x += (mouseX - camera.position.x) * .05;
  //   camera.position.y += (-mouseY - camera.position.y) * .05;
  // } else {
  //   camera.position.x += (controlX - camera.position.x) * .05;
  //   camera.position.y += (controlY - camera.position.y) * .05;
  //   camera.position.z += (controlZ - camera.position.z) * .05;
  // }

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

$(init);