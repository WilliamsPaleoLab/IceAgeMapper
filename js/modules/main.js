console.log("Welcome to Ice Age Mapper (Version 2.2)\n\tAuthor: Scott Farley \n\t University of Wisconsin")

//load external libraries and frameworks
var jquery = jQuery = $ = require("./../../bower_components/jquery/dist/jquery.min.js");
var _ = require("./../../bower_components/underscore/underscore-min.js");
var crossfilter = require("./../../bower_components/crossfilter/crossfilter.min.js");
var d3 = require("./../../bower_components/d3/d3.min.js");
var queue = require("./../../bower_components/d3-queue/d3-queue.js");
var crossfilter = require("./../../bower_components/crossfilter/crossfilter.min.js");
var awesomplete = require("./../../bower_components/awesomplete/awesomplete.min.js");
// var dc = require("./../../bower_components/dcjs/dc.min.js");


//load the application components
var config = require("./config/config.js");
var state = require("./config/state.js");
var prototypes = require("./config/prototypes.js");
var IO = require("./processes/io.js");
var process = require("./processes/process.js");
var filter = require("./processes/filters.js");
var utils = require("./processes/utils.js");
var charts = require("./ui/charts.js");
var layout = require("./ui/layout.js");
var map = require("./ui/map.js");
var sitePanel = require("./ui/sitePanel.js");
var mapUtils = require("./ui/map_utils.js");
var uiutils = require("./ui/ui-utils.js");
var ui = require("./ui/ui.js");

//custom methods on javascript object primitives
prototypes.enableAllPrototypes();
