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

var booksize = [18, 25, 5];

var positions = [[-25,  10, 20], [0,  10, 20], [25,  10, 20],
                 [-25, -22, 20], [0, -22, 20], [25, -22, 20],
                 [-25, -57, 20], [0, -57, 20], [25, -57, 20],
                 [-25, -86, 20], [0, -86, 20], [25, -86, 20]]
// 
for (var i = 0, len = positions.length; i < len; ++i) {
  positions[i][0] += bookcase.x + 43;
  positions[i][1] += bookcase.y + 110;
  positions[i][1] += bookcase.z;
}

var X = 0, Y = 1, Z = 2;