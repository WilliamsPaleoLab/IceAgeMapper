var IO = require("./../processes/io.js");
var ui = require("./ui.js");
var UIUtils = require("./ui-utils.js");
var sitePanel = require("./sitePanel.js");

var UIEvents = (function(){

  var onEcolGroupDropdownChange = function(){
    $("#ecolGroupSelect").change(function(){
      selectedGrp = $("#ecolGroupSelect :selected").val()
      UIUtils.filterAndPopulateTaxaDropdown(selectedGrp, window.appData.taxa);
      window.state.searchSwitch = "browse";
    })
  }

  var onTaxaSearchChange = function(){
    $("#taxaAutocomplete").change(function(){
      window.state.searchSwitch = "search";
    })
  }

  var onSearchButtonClick = function(){
    $("#searchButton").click(function(){
      window.state.taxonname = $("#taxaAutocomplete").val()
      window.state.taxonid = $("#taxonSelect :selected").val()
      IO.getNeotomaData(window.config, window.state, ui.onNeotomDataReceipt)
    })
  }

  var onSendShareRequestButtonClick = function(){
    $("#sendShareRequest").click(function(){
      UIUtils.handleShareRequestEvent();
    })
  }

  var updateMapSize = function(){
    //re-render the map when panel size changes
    var map = window.map;
    if (map != undefined){
      if (map.loaded()){
          map.resize();
      }else{
        map.on('load', function(){
          map.resize();
        })
      }
    }else {
      throw "Map not initialized"
    }
  }

  var enableMapViewLogging = function(map){
    map.on('moveend', function(){
      ///update map component of state
      var center = map.getCenter()
      var zoom = map.getZoom()
      var bearing = map.getBearing();
      var pitch = map.getPitch();
      map.center = center
      map.zoom = zoom
      map.bearing = bearing;
    })
  }

  var enableClickOnPopup = function(){
    var el = $(".mapboxgl-popup-content").find("a")[0]
    var $el = $(el)
    $el.on('click', function(e){
      var sitePanel = require('./sitePanel.js');
      siteID = $el.data('siteid')
      sitePanel.open(siteID)
    })
  }

  var enableSiteDetailsOnMapClick = function(map){
    map.on('click', function(e){
      lng = e.lngLat.lng
      lat = e.lngLat.lat
      sitePanel.triggerPopup(lat, lng)
    })
  }

  function enableAll(){
    onEcolGroupDropdownChange();
    onTaxaSearchChange();
    onSearchButtonClick();
    onSendShareRequestButtonClick();
  }

  return  {
    enableAll: enableAll,
    enableMapViewLogging: enableMapViewLogging,
    updateMapSize: updateMapSize,
    enableSiteDetailsOnMapClick: enableSiteDetailsOnMapClick,
    enableClickOnPopup: enableClickOnPopup
  }
})();

module.exports = UIEvents
