//This is Ice Age Mapper Version 2.1

console.log("Welcome to Ice Age Mapper (Version 2.2)\n\tAuthor: Scott Farley \n\tUniversity of Wisconsin")

//load external libraries and frameworks
var $ = jQuery = jquery = require("jquery");
global.jQuery = window.$ = window.jQuery = $;
var bootstrap = require("bootstrap");
require("jquery-ui-bundle");
require('./../../lib/layout.js');
var mapboxgl = require('mapbox-gl');
var _ = require("underscore");
var crossfilter = require("crossfilter");
var d3 = require("d3");
var queue = require("d3-queue");
var crossfilter = require("crossfilter");
var awesomplete = require("awesomplete");
var dc = require("dc");
var toastr = require('toastr');

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


// custom methods on javascript object primitives
prototypes.enableAllPrototypes();



//initialize with configuration
function initialize(){
  theLayout = layout.create(config, state);
  console.log(theLayout)
}

$(document).ready(function(){
  initialize();
})
