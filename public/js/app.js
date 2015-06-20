requirejs.config({
  baseUrl: 'js',
  paths: {
    THREE: 'libs/three.min.js',
    OBJMTLLoader: 'loaders/OBJMTLLoader.js',
    BlendCharacter: 'loaders/BlendCharacter.js',
    SubdivisionModifier: 'modifiers/SubdivisionModifier.js',
    Projector: 'renderers/Projector.js',
    Detector: 'renderers/Detector.js',
    ColorThief: 'libs/color-thief.min.js',
    jquery: 'libs/jquery-1.11.2.min.js'
  },
  shim: {
    THREE: {
      exports: 'THREE'
    },
    OBJMTLLoader: {
      deps: ['THREE'],
      exports: ['THREE.OBJMTLLoader']
    },
    BlendCharacter: {
      deps: ['THREE'],
      exports: ['THREE.BlendCharacter']
    },
    SubdivisionModifier: {
      deps: ['THREE'],
      exports: ['THREE.SubdivisionModifier']
    },
    Projector: {
      deps: ['THREE'],
      exports: ['THREE.Projector']
    },
    Detector: {
      deps: ['THREE'],
      exports: ['THREE.Detector']
    },
    ColorThief: {
      exports: 'ColorThief',
    }
  }
});

requirejs(['main'], function(main) {
  main.init();
});