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