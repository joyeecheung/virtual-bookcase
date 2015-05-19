var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
// http://www.javascripter.net/faq/keycodes.htm
var directionDict = {
  37: "LEFT",
  38: "AHEAD",
  39: "RIGHT",
  40: "BACK",
  187: "UP",
  189: "DOWN",
  61: "UP",
  173: "DOWN"
};

var direction = {
  "LEFT":  new THREE.Vector3(-1, 0, 0),
  "UP":    new THREE.Vector3(0, 1, 0),
  "DOWN":  new THREE.Vector3(0, -1, 0),
  "RIGHT": new THREE.Vector3(1, 0, 0),
  "AHEAD": new THREE.Vector3(0, 0, -1),
  "BACK":  new THREE.Vector3(0, 0, 1)
};

var X = 0, Y = 1, Z = 2;  // coordinates
var coor = ["x", "y", "z"];

var materialIdx = {
  "RIGHT": 0,
  "LEFT": 1,
  "TOP": 2,
  "BOTTOM":3,
  "FRONT": 4,
  "BACK": 5
};

function imageMaterial(imgurl) {
  return new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture(imgurl)
  });
}

function repeatImageMaterial(imgurl, repeatx, repeaty) {
  var texture = THREE.ImageUtils.loadTexture(imgurl);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatx, repeaty);
  return new THREE.MeshBasicMaterial({
    map: texture
  });
}

function coloredMaterial(color) {
  return new THREE.MeshLambertMaterial({color: color});
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

function rgbToHex(r, g, b) {
    return ((r << 16) + (g << 8) + b);
}

function addAnimation(func, startTime, duration) {
  var stop = false;

  function step() {
    if (stop) return;

    var now = +Date.now();
    var remaining = +startTime + +duration - now;
    var rate = 1;
    if (duration === 1 || remaining < 60) {
      stop = true;
    } else {
      rate = remaining / duration;
      rate = 1 - Math.pow(rate, 3);
      if(rate > 1 || rate < 0) {
        stop = true;
        rate = 1;
      }
    }

    func(rate);
    requestAnimationFrame(step);
  }

  step();
}