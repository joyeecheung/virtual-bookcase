module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)
  path = require('path')

  grunt.initConfig
    watch:
      options:
        livereload: true
      express:
        files: [ "controllers/**/*.js", "models/**/*.js",
                 "routes/**/*.js", "views/**/*.jade",
                 "Gruntfile.*"]
        tasks: ["express:dev"]
        options:
          spawn: false
      public:
        files: ["public/**/*"]
        options:
          livereload: true

    express:
      dev:
        options:
          script: 'bin/www'
          livereload: true

  grunt.registerTask "default", ["express", "watch"]
