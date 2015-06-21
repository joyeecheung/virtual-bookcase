define('utils', ['MMCQ', 'THREE', 'SubdivisionModifier'], 
function(MMCQ, THREE) {
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
    return new THREE.MeshBasicMaterial({color: color});
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

  function getHexColor(sourceImage, quality, cb) {
      getColor(sourceImage, quality, function(color) {
        cb(rgbToHex.apply(this, color));
      });
  };

  /*
   * getColor(sourceImage[, quality])
   * returns {r: num, g: num, b: num}
   *
   * Use the median cut algorithm provided by quantize.js to cluster similar
   * colors and return the base color from the largest cluster.
   *
   * Quality is an optional argument. It needs to be an integer. 0 is the highest quality settings.
   * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
   * faster a color will be returned but the greater the likelihood that it will not be the visually
   * most dominant color.
   *
   * */
  function getColor(sourceImage, quality, cb) {
      var palette = getPalette(sourceImage, 5, quality, function(palette) {
        var dominantColor = palette[0];
        return cb(dominantColor);
      });
  };


  /*
   * getPalette(sourceImage[, colorCount, quality])
   * returns array[ {r: num, g: num, b: num}, {r: num, g: num, b: num}, ...]
   *
   * Use the median cut algorithm provided by quantize.js to cluster similar colors.
   *
   * colorCount determines the size of the palette; the number of colors returned. If not set, it
   * defaults to 10.
   *
   * BUGGY: Function does not always return the requested amount of colors. It can be +/- 2.
   *
   * quality is an optional argument. It needs to be an integer. 0 is the highest quality settings.
   * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
   * faster the palette generation but the greater the likelihood that colors will be missed.
   *
   *
   */
   function getPalette (sourceImage, colorCount, quality, cb) {
      if (typeof colorCount === 'undefined') {
          colorCount = 10;
      }
      if (typeof quality === 'undefined') {
          quality = 10;
      }

      // Create custom CanvasImage object
      var image      = new CanvasImage(sourceImage);
      var imageData  = image.getImageData();
      var pixels     = imageData.data;
      var pixelCount = image.getPixelCount();

      var worker = new Worker('js/color-worker.js');
      worker.addEventListener('message', function(e) {
          cb(e.data);
      });

      // Starting the web worker.
      // (Imagine the function getImageDataUsingCanvas to create a
      // canvas, drawing the image on its context and then returning
      // the image data.)
      worker.postMessage({
        pixelCount: pixelCount,
        quality: quality,
        pixels: pixels,
        colorCount: colorCount
      });

      // Clean up
      image.removeCanvas();
  };

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
    addAnimation: addAnimation,
    addIdleAnimation: addIdleAnimation,
    renderIdleAnimation: renderIdleAnimation,
    getHexColor: getHexColor
  }
});
