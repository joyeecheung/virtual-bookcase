module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)
  path = require('path')

  grunt.initConfig
    watch:
      options:
        livereload: true
      express:
        files: [ "**/*.js", "**/*.jade", "Gruntfile.*", "!public/**/*.js" ]
        tasks: ["express:dev"]
        options:
          spawn: false

    express:
      dev:
        options:
          script: 'bin/www'
          livereload: true

  grunt.registerTask "default", ["express", "watch"]
