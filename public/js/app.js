requirejs.config({
  baseUrl: 'js',
  paths: {
    THREE: 'libs/three.min',
    OBJLoader: 'loaders/OBJLoader',
    MTLLoader: 'loaders/MTLLoader',
    OBJMTLLoader: 'loaders/OBJMTLLoader',
    BlendCharacter: 'loaders/BlendCharacter',
    SubdivisionModifier: 'modifiers/SubdivisionModifier',
    Projector: 'renderers/Projector',
    Detector: 'renderers/Detector',
    CanvasImage: 'libs/color-thief.min',
    jquery: 'libs/jquery-1.11.2.min'
  },
  shim: {
    THREE: {
      exports: 'THREE'
    },
    OBJLoader: {
      deps: ['THREE'],
      exports: 'THREE.OBJLoader'
    },
    MTLLoader: {
      deps: ['THREE'],
      exports: 'THREE.MTLLoader'
    },
    OBJMTLLoader: {
      deps: ['THREE', 'MTLLoader', 'OBJLoader'],
      exports: 'THREE.OBJMTLLoader'
    },
    BlendCharacter: {
      deps: ['THREE'],
      exports: 'THREE.BlendCharacter'
    },
    SubdivisionModifier: {
      deps: ['THREE'],
      exports: 'THREE.SubdivisionModifier'
    },
    Projector: {
      deps: ['THREE'],
      exports: 'THREE.Projector'
    },
    Detector: {
      deps: ['THREE'],
      exports: 'THREE.Detector'
    },
    CanvasImage: {
      exports: 'CanvasImage',
    }
  }
});

requirejs(['main'], function(main) {
  main.init();
});