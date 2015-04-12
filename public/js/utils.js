var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var directionDict = {
  37: "LEFT",
  38: "UP",
  39: "RIGHT",
  40: "DOWN"
}
var direction = {
  LEFT: {
    x: -1,
    y: 0,
    z: 0
  },
  UP: {
    x: 0,
    y: 1
  },
  DOWN: {
    x: 0,
    y: -1
  },
  RIGHT: {
    x: 1,
    y: 0
  } 
}

var bookcase = {
  obj: '/obj/bookcase/bookcase.obj',
  mtl: '/obj/bookcase/bookcase.mtl',
  x: -40,
  y: -105,
  z: 0
}

var booksize = [20, 25, 5];

var positions = [[-25, 10, 20], [0, 10, 20], [25, 10, 20],
                 [-25, -22, 20], [0, -22, 20], [25, -22, 20] ]

for (var i = 0, len = positions.length; i < len; ++i) {
  positions[i][0] += bookcase.x + 40;
  positions[i][1] += bookcase.y + 110;
  positions[i][1] += bookcase.z;
}
