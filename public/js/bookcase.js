var books = [];
var bookcaseObj;

var bookcaseConfig = {
  obj: '/obj/bookcase/bookcase.obj',
  mtl: '/obj/bookcase/bookcase.mtl',
  position: new THREE.Vector3(0, -90, 10),  // move down a little bit
  scale:    new THREE.Vector3(2.4, 2, 2),  // scale it
  holders:  [[-23,  14, 0], [1,  14, 0], [24,  14, 0],
             [-23, -11, 0], [1, -11, 0], [24, -11, 0],
             [-23, -37, 0], [1, -37, 0], [24, -37, 0],
             [-23, -62, 0], [1, -62, 0], [24, -62, 0]],
  offset:   new THREE.Vector3(0, 110, -10)
};

var bookConfig = {
  size: new THREE.Vector3(15, 20, 3),
  angle: new THREE.Vector3(-0.1, 0, 0),
  materials: {
    right: imageMaterial('obj/bookcase/bookpages-right.jpg'),
    left: coloredMaterial(0XA6A6A6),
    top: imageMaterial('obj/bookcase/bookpages-top.jpg'),
    bottom: imageMaterial('obj/bookcase/bookpages-top.jpg'),
    back: coloredMaterial(0XA6A6A6)
  },
  responseDelta: new THREE.Vector3(0, 0, 20),
  responseDuration: 400
}

var uppedBook;

/************* Bookcase *************/


function adjustOffset(value, idx) {
  return value + bookcaseConfig.position[coor[idx]] + bookcaseConfig.offset[coor[idx]];
}

bookcaseConfig.holders = $.map(bookcaseConfig.holders, function(holder, i) {
  return new THREE.Vector3().fromArray($.map(holder, adjustOffset));
});

function Bookcase(object) {
  $.extend(object.position, bookcaseConfig.position);
  $.extend(object.scale, bookcaseConfig.scale);
  return object;
}

/************** Bookcase loader ***********************/
function loadBookcase(scene) {
  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
  var loader = new THREE.OBJMTLLoader();

  loader.load(bookcaseConfig.obj, bookcaseConfig.mtl,
    function(object) {
      bookcaseObj = new Bookcase(object);  // global!
      receiveShadow(bookcaseObj);
      castShadow(bookcaseObj);
      scene.add(bookcaseObj);
    });
}

/************* Book *************/


function Book(book, idx) {
  var geometry = new THREE.BoxGeometry(bookConfig.size.x,
                                       bookConfig.size.y,
                                       bookConfig.size.z);
  var material = new THREE.MeshFaceMaterial([
    bookConfig.materials.right,  // right
    bookConfig.materials.left,  // left
    bookConfig.materials.top,  // Top
    bookConfig.materials.bottom,  // Bottom
    imageMaterial(book.cover),  // Front
    bookConfig.materials.back   // Back
  ]);

  var bookObj = new THREE.Mesh(geometry, material);
  bookObj.book = book;
  bookObj.idx = idx;
  bookObj.holder = bookcaseConfig.holders[idx];

  bookObj.position.set(bookObj.holder.x,
                       bookObj.holder.y,
                       bookObj.holder.z);
  bookObj.rotateX(bookConfig.angle.x);
  bookObj.rotateY(bookConfig.angle.y);
  bookObj.rotateZ(bookConfig.angle.z);

  bookObj.castShadow = true;
  bookObj.receiveShadow = true;

  return bookObj;
}

function loadBook(scene, idx, book) {
  var bookObj = new Book(book, idx);

  // color the left and back faces by the dominant color in the cover
  var loader = new THREE.ImageLoader();
  var colorThief = new ColorThief();
  loader.load(book.cover, function(image) {
    
    var color = colorThief.getColor(image, 1000);
    var hex = rgbToHex.apply(this, color);
    var newMaterial = coloredMaterial(hex);
    bookObj.material.materials[materialIdx.LEFT] = newMaterial;
    bookObj.material.materials[materialIdx.BACK] = newMaterial;
    bookObj.material.needsUpdate = true;
  });

  scene.add(bookObj);
  books.push(bookObj);  // global!
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
  $('#gl-panel').removeClass('inactive').addClass('active');
  $('#gl-container').addClass('in-select');
}

function bookPanelOut() {
  $('#gl-panel').removeClass('active').addClass('inactive');
  $('#gl-container').removeClass('in-select');
}

function selectBook(bookObj) {
  // local reference is faster
  var delta = bookConfig.responseDelta;
  var holder = bookObj.holder;

  function bookUp(rate) {
    bookObj.position.y =
      holder.y + delta.y * rate;
    bookObj.position.z =
      holder.z + delta.z * rate;
  }

  addAnimation(bookUp, Date.now(), bookConfig.responseDuration);
}

function deselectBook(bookObj) {
  if (!bookObj)
    return;

  // local reference is faster
  var delta = bookConfig.responseDelta;
  var holder = bookObj.holder;

  function bookDown(rate) {
    bookObj.position.y =
      holder.y + delta.y * (1 - rate);
    bookObj.position.z =
      holder.z + delta.z * (1 - rate);
  }

  addAnimation(bookDown, Date.now(), bookConfig.responseDuration);
}

function handlBookSelection(e, renderer, camera) {
  var intersects = getIntersects(e, books, renderer, camera);
  if (intersects.length > 0) {
    newUppedBook = intersects[0].object;
    bookPanelIn(newUppedBook.book);
  } else {
    bookPanelOut();
  }
}

function bookResponse(e, renderer, camera) {
  var intersects = getIntersects(e, books, renderer, camera);
  var oldUppedBook = uppedBook;

  if (intersects.length > 0) {
    newUppedBook = intersects[0].object;
    if (newUppedBook === oldUppedBook)
      return;

    uppedBook = newUppedBook;
    selectBook(newUppedBook);
    $('#gl-container').addClass('in-select');
  } else if (oldUppedBook){
    uppedBook = undefined;
    deselectBook(oldUppedBook);
    $('#gl-container').removeClass('in-select');
  }
}