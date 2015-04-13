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
  position: {
    x: 0,
    y: -90,
    z: 0
  },
  scale: {
    x: 2.4,
    y: 2,
    z: 2
  }
}

var X = 0, Y = 1, Z = 2;
var booksize = [15, 20, 3];
var bookAngle = {
  x: -0.1,
  y: 0,
  z: 0
}

var positions = [[-23,  14, 0], [1,  14, 0], [24,  14, 0],
                 [-23, -11, 0], [1, -11, 0], [24, -11, 0],
                 [-23, -37, 0], [1, -37, 0], [24, -37, 0],
                 [-23, -62, 0], [1, -62, 0], [24, -62, 0]]

for (var i = 0, len = positions.length; i < len; ++i) {
  positions[i][X] += bookcase.position.x;
  positions[i][Y] += bookcase.position.y + 110;
  positions[i][Z] += bookcase.position.z - 10;
}

function loadBook(scene, idx, book) {
  var geometry = new THREE.BoxGeometry(booksize[X], booksize[Y], booksize[Z]);

  function imageMaterial(imgurl) {
    return new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture(imgurl)
    });
  }

  function coloredImageMaterial(imgurl, color) {
    return new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture(imgurl),
      color: color
    })
  }

  var materials = [
      imageMaterial('obj/bookcase/bookpages-right.jpg'),  // right
      coloredImageMaterial('obj/bookcase/bookbinding.jpg', '#FFFFFF'),  // left
      imageMaterial('obj/bookcase/bookpages-top.jpg'),  // Top
      imageMaterial('obj/bookcase/bookpages-top.jpg'),  // Bottom
      imageMaterial(book.cover),  // Front
      imageMaterial('obj/bookcase/hard-cover.jpg')   // Back
  ];

  var bookObj = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
  bookObj.position.set.apply(bookObj.position, positions[idx]);
  bookObj.rotateX(bookAngle.x);
  bookObj.rotateY(bookAngle.y);
  bookObj.rotateZ(bookAngle.z);

  bookObj.book = book;
  bookObj.idx = idx;
  scene.add(bookObj);
  books.push(bookObj);
}

function loadBookcase(scene) {
  function objectPosition(object, position, scale) {
    object.position.set(position.x || object.position.x,
                        position.y || object.position.y,
                        position.z || object.position.z)
    object.scale.set(scale.x || object.scale.x,
                     scale.y || object.scale.y,
                     scale.z || object.scale.z)
    scene.add(object);
  }

  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

  var loader = new THREE.OBJMTLLoader();
  loader.load(bookcase.obj, bookcase.mtl,
    function(object) {
      objectPosition(object, bookcase.position, bookcase.scale);
      bookcaseObj = object;
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