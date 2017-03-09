module.exports = function(config)
{
    config.set({

        basePath: '',

        frameworks: ['browserify', 'jasmine'],

        files: [
            'js/tests/bundle.test.js'
        ],

        exclude: [
        ],

        preprocessors: {
            'js/test/*.js': ['browserify']
        },

        reporters: ['progress', 'html'],

        htmlReporter: {
        outputDir: 'js/tests/output', // where to put the reports
        templatePath: null, // set if you moved jasmine_template.html
        focusOnFailures: true, // reports show failures on start
        namedFiles: false, // name files instead of creating sub-directories
        pageTitle: null, // page title for reports; browser info by default
        urlFriendlyName: false, // simply replaces spaces with _ for files/dirs
        reportName: 'unitTestsSummary', // report summary filename; browser info by default


        // experimental
        preserveDescribeNesting: false, // folded suites stay folded
        foldAll: false, // reports start folded (only with preserveDescribeNesting)
      },

        port: 9876,

        colors: true,

        logLevel: config.LOG_DEBUG,

        autoWatch: false,

        browsers: ['PhantomJS'],

        browserify: {
            debug: true,
            transform: []
        },

        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine','karma-bro', 'karma-html-reporter'],

        singleRun: true
    });
};
