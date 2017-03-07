module.exports = function (grunt)
{
    "use strict";

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-karma');

    grunt.initConfig(
        {
            pkg: grunt.file.readJSON('package.json'),
            browserify:
            {
                dev:
                {
                    files:
                    {
                        'js/modules/static/bundle.js': ['js/modules/main.js']
                    },
                    options:
                    {
                        browserifyOptions:
                        {
                            debug: true
                        }
                    }
                }
            },
            karma:{
                unit:{
                    configFile:"karma.conf.js"
                }
            }
        });
};
