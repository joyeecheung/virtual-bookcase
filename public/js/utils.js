define('utils', ['THREE', 'SubdivisionModifier'], 
function(THREE) {
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

  function smooth(object, div) {
    if (!object.geometry && object.children) {
      for (var i = 0; i < object.children.length; ++i) {
        smooth(object.children[i]);
      }
      return object;
    } else if (object.geometry) {
      // First we want to clone our original geometry.
      // Just in case we want to get the low poly version back.
      var smoothed = object.geometry.clone();
      // Next, we need to merge vertices to clean up any unwanted vertex. 
      smoothed.mergeVertices();
      smoothed.computeFaceNormals();
      smoothed.computeVertexNormals();
      // Create a new instance of the modifier and pass the number of divisions.
      var modifier = new THREE.SubdivisionModifier(div || 1);
      // Apply the modifier to our cloned geometry.
      modifier.modify(smoothed);
      object.geometry = smoothed;
      object.geometry.needsUpdate = true;
    }
    return object;
  }

  function castShadow(object) {
    if (object.type === "Mesh") {
      object.castShadow = true;
    } else {
      for (var i = 0; i < object.children.length; ++i) {
        castShadow(object.children[i]);
      }
    }
    object.castShadow = true;
  }

  function receiveShadow(object) {
    if (object.type === "Mesh") {
      object.receiveShadow = true;
    } else {
      for (var i = 0; i < object.children.length; ++i) {
        receiveShadow(object.children[i]);
      }
    }
    object.receiveShadow = true;
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

  var idleFuncQueue = [];

  function addIdleAnimation(func) {
    idleFuncQueue.push(func);
  }

  function renderIdleAnimation(delta) {
    for (var i = 0; i < idleFuncQueue.length; ++i) {
      idleFuncQueue[i](delta);
    }
  }

  return {
    directionDict: directionDict,
    direction: direction,
    materialIdx: materialIdx,
    imageMaterial: imageMaterial,
    repeatImageMaterial: repeatImageMaterial,
    coloredMaterial: coloredMaterial,
    getIntersects: getIntersects,
    smooth: smooth,
    castShadow: castShadow,
    receiveShadow: receiveShadow,
    rgbToHex: rgbToHex,
    addAnimation: addAnimation,
    addIdleAnimation: addIdleAnimation,
    renderIdleAnimation: renderIdleAnimation
  }
});
