//This is Ice Age Mapper Version 2.1

console.log("Welcome to Ice Age Mapper (Version 2.2)\n\tAuthor: Scott Farley \n\tUniversity of Wisconsin")

//load external jquery core and layout plugin
var $ = jQuery = jquery = require("jquery");
global.jQuery = window.$ = window.jQuery = $;
require("jquery-ui-bundle");
require('./ui/jquery-layout.js');
require("bootstrap");

window.mapboxToken = "pk.eyJ1Ijoic2ZhcmxleTIiLCJhIjoiY2lmeWVydWtkNTJpb3RmbTFkdjQ4anhrMSJ9.jRJCOGU1AOHfNXHH7cwU7Q"


//load the application components
// var config = require("./config/config.js");
// var state = require("./config/state.js");
var prototypes = require("./config/prototypes.js");
var UIEvents = require("./ui/events.js");
var appData = require("./config/data.js");


// var utils = require("./processes/utils.js");


//holds UI elements
var ui = require("./ui/ui.js");


// custom methods on javascript object primitives
prototypes.enableAllPrototypes();

//juqery events on the UI
UIEvents.enableAll();

//attach datasets to the window so we can use them on events
window.appData = appData.create();

$(document).ready(function(){
  ui.create();
})
