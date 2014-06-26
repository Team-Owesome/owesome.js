module.exports = function(grunt)
{
    // Load dev dependencies
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take for build time optimizations
    require('time-grunt')(grunt);

    var SRC_DIR = './src';

    var BUILD_DIR = './build';
    var INTERMEDIATE_DIR = './intermediate';

    grunt.initConfig(
    {
        pkg: grunt.file.readJSON('package.json'),

        watch:
        {
            glsl:
            {
                files: SRC_DIR + '/**/*.{vert,frag}',
                tasks: ['replace:dist', 'concat:dist']
            },

            js:
            {
                files: SRC_DIR + '/**/*.js',
                tasks: ['concat:dist']
            }
        },

        concat:
        {
            dist:
            {
                src:
                [
                    SRC_DIR + '/core.js',
                    INTERMEDIATE_DIR + '/*.{vert,frag}',
                    SRC_DIR + '/test.js'
                ],
                dest: BUILD_DIR + '/main.js',
            },
        },


        replace:
        {


            dist:
            {
                options:
                {
                    patterns:
                    [
                        {
                            match: /(\r\n|\n|\r)/g,
                            replacement: ''
                        },

                        {
                            match: /\s+/g,
                            replacement: ' '
                        },

                        {
                            match: /^\/\/ (.+?)(\r\n|\n|\r)/g,
                            replacement: '$1 = \''
                        },

                        {
                            match: /$/g,
                            replacement: '\''
                        }
                    ]
                },

                files:
                [
                    { expand: true, flatten: true, src: SRC_DIR + '/**/*.{vert,frag}', dest: INTERMEDIATE_DIR }
                ]
            }
        }
    });
};
