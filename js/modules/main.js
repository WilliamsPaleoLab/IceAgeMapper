//This is Ice Age Mapper Version 2.1

console.log("Welcome to Ice Age Mapper (Version 2.2)\n\tAuthor: Scott Farley \n\tUniversity of Wisconsin")

//load external jquery core and layout plugin
var $ = jQuery = jquery = require("jquery");
global.jQuery = window.$ = window.jQuery = $;
require("jquery-ui-bundle");
require('./../../lib/layout.js');
require("bootstrap");

window.mapboxToken = "pk.eyJ1Ijoic2ZhcmxleTIiLCJhIjoiY2lmeWVydWtkNTJpb3RmbTFkdjQ4anhrMSJ9.jRJCOGU1AOHfNXHH7cwU7Q"


//load the application components
var config = require("./config/config.js");
var state = require("./config/state.js");
var prototypes = require("./config/prototypes.js");
var utils = require("./processes/utils.js");


//holds UI elements
var ui = require("./ui/ui.js");

// custom methods on javascript object primitives
prototypes.enableAllPrototypes();

//see if the user passed in a saved map token
shareToken = utils.getParameterByName('shareToken');


$(document).ready(function(){
  if (utils.isValidToken(shareToken)){
    ui.load(shareToken)
  }else{
    ui.loadClean();
  }
})
