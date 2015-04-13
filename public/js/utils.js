var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
// http://www.javascripter.net/faq/keycodes.htm
var directionDict = {
  37: "LEFT",
  38: "UP",
  39: "RIGHT",
  40: "DOWN",
  187: "AHEAD",
  189: "BACK",
  61: "AHEAD",
  173: "BACK"
}
var direction = {
  LEFT: {
    x: -1,
    y: 0,
    z: 0
  },
  UP: {
    x: 0,
    y: 1,
    z: 0
  },
  DOWN: {
    x: 0,
    y: -1,
    z: 0
  },
  RIGHT: {
    x: 1,
    y: 0,
    z: 0
  },
  AHEAD: {
    x: 0,
    y: 0,
    z: -1
  },
  BACK: {
    x: 0,
    y: 0,
    z: 1
  }
}

var bookcase = {
  obj: '/obj/bookcase/bookcase.obj',
  mtl: '/obj/bookcase/bookcase.mtl',
  x: -40,
  y: -75,
  z: 0
}

var X = 0, Y = 1, Z = 2;
var booksize = [19, 25, 5];

var positions = [[-25,  10, 20], [0,  10, 20], [25,  10, 20],
                 [-25, -22, 20], [0, -22, 20], [25, -22, 20],
                 [-25, -57, 20], [0, -57, 20], [25, -57, 20],
                 [-25, -86, 20], [0, -86, 20], [25, -86, 20]]
// 
for (var i = 0, len = positions.length; i < len; ++i) {
  positions[i][X] += bookcase.x + 43;
  positions[i][Y] += bookcase.y + 110;
  positions[i][Z] += bookcase.z;
}



function loadBook(scene, idx, book) {
  var geometry = new THREE.BoxGeometry(booksize[X], booksize[Y], booksize[Z]);

  function imageMaterial(imgurl) {
    return new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture(imgurl)}
    );
  }

  var materials = [
      imageMaterial('obj/bookcase/bookpages-right.jpg'),  // right
      imageMaterial('obj/bookcase/bookbinding.jpg'),  // left
      imageMaterial('obj/bookcase/bookpages-top.jpg'),  // Top
      imageMaterial('obj/bookcase/bookpages-top.jpg'),  // Bottom
      imageMaterial(book.cover),  // Front
      imageMaterial('obj/bookcase/hard-cover.jpg')   // Back
  ];

  var boxObj = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
  boxObj.position.set.apply(boxObj.position, positions[idx]);
  boxObj.book = book;
  boxObj.idx = idx;
  scene.add(boxObj);
  books.push(boxObj);
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

function getIntersects(e, objects, renderer, camera) {
  var rect = renderer.domElement.getBoundingClientRect();
  var mouseVector = new THREE.Vector2( 
       ((e.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1, 
       1 - ((e.clientY - rect.top) / renderer.domElement.clientHeight) * 2);

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouseVector, camera);
  return raycaster.intersectObjects(objects);
}

function bookPanelIn(book) {
  $('#gl-panel-cover').prop('src', book.cover);
  $('#gl-panel-title').text(book.name);
  $('#gl-panel-url')
    .prop('href', book.url)
    .prop('target', '_blank');
  $('#gl-panel-amazon')
    .prop('href', 'http://www.amazon.com/dp/' + book.isbn)
    .prop('target', '_blank');
  $('#gl-panel-isbn').text(book.isbn);
  $('#gl-panel').fadeIn('100');
  $('#gl-panel').removeClass('hidden');
}

function bookPanelOut() {
  $('#gl-panel').fadeOut('100', function() {
    $('#gl-panel').addClass('hidden');
  });
}