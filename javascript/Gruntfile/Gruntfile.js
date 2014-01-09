(function() {
  module.exports = function(grunt) {
    grunt.initConfig({
      pkg: grunt.file.readJSON("package.json"),
      coffee: {
        Grunt: {
          files: {
            'javascript/Gruntfile/Gruntfile.js': 'coffee/Gruntfile/**/*.coffee'
          }
        },
        server: {
          files: {
            'javascript/server/server.js': 'coffee/server/**/*.coffee'
          },
          options: {
            bare: true
          }
        },
        client: {
          files: {
            'javascript/client/client.js': 'coffee/client/**/*.coffee'
          },
          options: {
            bare: true
          }
        },
        lib: {
          files: {
            'javascript/lib/lib.js': 'coffee/lib/**/*.coffee'
          },
          options: {
            bare: true
          }
        }
      },
      uglify: {
        options: {
          mangle: true,
          compress: true,
          banner: "/* <%= pkg.author %> | <%= grunt.template.today('dd-mm-yyyy') %> */\n"
        },
        Grunt: {
          files: {
            'Gruntfile.js': ['javascript/Gruntfile/Gruntfile.js']
          }
        },
        server: {
          files: {
            'αSΨS/server/server.js': ['javascript/server/server.js']
          }
        },
        client: {
          files: {
            'αSΨS/client/client/client.min.js': ['javascript/client/client.js']
          }
        },
        vendor: {
          files: {
            'αSΨS/client/vendor/vendor.min.js': ['client/vendor.js']
          }
        },
        lib: {
          files: {
            'αSΨS/lib/lib.min.js': ['javascript/lib/lib.js']
          }
        }
      },
      jshint: {
        options: {
          curly: true,
          eqeqeq: true,
          eqnull: true,
          browser: true,
          sub: true
        },
        Grunt: ['javascript/Gruntfile/Gruntfile.js'],
        server: ['javascript/server/server.js'],
        client: ['javascript/client/client.js'],
        lib: ['javascript/lib/lib.js']
      },
      coffeelint: {
        options: {
          'max_line_length': {
            'level': 'ignore'
          },
          'camel_case_classes': {
            'level': 'ignore'
          }
        },
        Grunt: ['coffee/Gruntfile/**/*.coffee'],
        server: ['coffee/server/**/*.coffee'],
        client: ['coffee/client/**/*.coffee'],
        lib: ['coffee/lib/**/*.coffee']
      },
      concat: {
        vendor: {
          files: {
            'javascript/client/vendor.js': ['bower_components/jquery/jquery.min.js', 'bower_components/modernizr/modernizr.js', 'bower_components/foundation/js/foundation.min.js']
          }
        }
      },
      jade: {
        dada: {
          files: {
            'client/alpha.html': ['jade/angular.jade']
          },
          options: {
            pretty: true
          }
        },
        client: {
          expand: true,
          cwd: 'jade',
          src: "**/*.jade",
          dest: "html",
          ext: ".html",
          options: {
            pretty: true
          }
        },
        clientmin: {
          expand: true,
          cwd: "jade",
          src: "**/*.jade",
          dest: "html",
          ext: ".html"
        }
      },
      htmlmin: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          useShortDoctype: true,
          removeEmptyAttributes: true
        },
        dada: {
          files: {
            'client/alphamin.html': ['client/alpha.html']
          }
        },
        client: {
          expand: true,
          cwd: 'html',
          src: "**/*.html",
          dest: "αSΨS/client/client",
          ext: ".html",
          options: {
            pretty: true
          }
        }
      },
      cssmin: {
        client: {
          expand: true,
          cwd: 'css',
          src: "**/*.css",
          dest: "αSΨS/client/client",
          ext: ".css",
          options: {
            pretty: true
          }
        },
        vendor: {
          files: {
            'αSΨS/client/vendor/vendor.css': ['bower_components/foundation/css/foundation.min.css']
          }
        }
      },
      stylus: {
        client: {
          expand: true,
          cwd: 'stylus',
          src: "**/*.stylus",
          dest: "css",
          ext: ".css",
          options: {
            pretty: true
          }
        }
      },
      watch: {
        server: {
          files: ['coffee/server/**/*.coffee'],
          tasks: ['default']
        },
        client_j: {
          files: ['coffee/client/**/*.coffee'],
          tasks: ['build_j']
        },
        client_b: {
          files: ['coffee/lib/**/*.coffee'],
          tasks: ['build_b']
        },
        client_h: {
          files: ['jade/*.jade'],
          tasks: ['build_h']
        },
        client_c: {
          files: ['stylus/*.stylus'],
          tasks: ['build_c']
        }
      }
    });
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-coffeelint');
    grunt.registerTask('default', ['coffeelint:server', 'coffee:server', 'jshint:server', 'uglify:server']);
    grunt.registerTask('g', ['coffeelint:Grunt', 'coffee:Grunt', 'jshint:Grunt', 'uglify:Grunt']);
    grunt.registerTask('build_j', ['coffeelint:client', 'coffee:client', 'jshint:client', 'uglify:client']);
    grunt.registerTask('build_b', ['coffeelint:lib', 'coffee:lib', 'jshint:lib', 'uglify:lib']);
    grunt.registerTask('build_h', ['jade:client', 'htmlmin:client']);
    grunt.registerTask('build_c', ['stylus:client', 'cssmin:client']);
    grunt.registerTask('build_r', ['jade:route', 'htmlmin:route']);
    return grunt.registerTask('build_v', ['concat:vendor', 'uglify:vendor', 'cssmin:vendor']);
  };

}).call(this);
