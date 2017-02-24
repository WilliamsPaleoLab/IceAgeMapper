// Karma configuration
// Generated on Thu Feb 23 2017 13:34:32 GMT-0600 (CST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    files: [
    "lib/angular.js",
    "lib/angular.mocks.js",
    'js/gallery/galleryList/*.module.js',
    'js/gallery/galleryList/*.component.js',
    'js/gallery/galleryList/*.spec.js',
    'js/gallery/gallery.js'
    ],

    // // list of files / patterns to load in the browser
    // files: [
    //   "https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js",
    //   "http://ajax.googleapis.com/ajax/libs/angularjs/X.Y.Z/angular-mocks.js",
    //   "https://cdnjs.cloudflare.com/ajax/libs/angular-resource/1.6.2/angular-resource.min.js",
    //   "https://ajax.googleapis.com/ajax/libs/angularjs/1.4.7/angular-route.js",
    //   // "js/gallery.js",
    //   'gallery.spec.js',
    //   // '**/*.module.js',
    //   // '*!(.module|.spec).js',
    //   // '**/*.spec.js'
    // ],



    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    plugins: [
        'karma-chrome-launcher',
        'karma-jasmine'
      ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
