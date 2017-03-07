var mapboxgl = require('mapbox-gl');
var utils = require('./../processes/utils.js');
var _ = require("underscore");


var sitePanel = (function(){

  var addSiteMetadata = function(activeSite){
    //site level metadata
    $("#siteName").text(activeSite.SiteName)
    $("#siteAltitude").text(activeSite.Altitude + "m")
    $("#siteDescription").text(activeSite.SiteDescription)
    $("#siteNotes").text(activeSite.SiteNotes)
  }

  var addDataTable = function(theseSamples){
    //build a data table
    //list each sample's value and age
    $("#sampleTable").empty();
    table = "<thead><th>Age</th><th>Value</th><th>Units</th></thead>"

    //add one row for each sample
    for (var i=0; i < theseSamples.length; i++){
      thisSample = theseSamples[i]
      table +=  "<tr><td>" + thisSample.age + "</td><td>" + thisSample.Value + "</td><td>" + thisSample.VariableUnits + "</td></tr>"
    }
    $("#sampleTable").html(table)
  }

  function addPIInformation(theseSamples){
    //all sites only have one dataset (in this model)
    //but some datasets have multiple listed PIs (some have none)
    piTable = ""
    for (var i = 0; i < theseSamples[0].datasetMeta.DatasetPIs.length; i++){
        thisSitePI = theseSamples[0].datasetMeta.DatasetPIs[i]
        piTable += "<tr><td>Dataset Investigator: </td><td>" + thisSitePI.ContactName + "</td><tr>"
    }
    if (piTable == ""){
      piTable = "<i>No Investigators Listed</i>"
    }
    $("#pi-table").html(piTable)
  }

  function getTheseSamples(siteID){
    theseSamples = utils.lookupSamples(siteID)
    theseSamples = _.sortBy(theseSamples, function(d){return d.age})
    return theseSamples
  }

  var doOpen = function(siteID){
    //open details about the clicked site
    //called from the map popups

    //reflect this event in the application state
    state.activeSite = utils.lookupSite(siteID)
    state.activeSiteID = siteID
    state.openSite = true; //programmatically open the map if the map is shared while the site window is open

    //do the actual panel open
    window.layout.open("west") //open the panel

    theseSamples = getTheseSamples(siteID)


    //add the UI elements
    addSiteMetadata(state.activeSite)

    addDataTable(theseSamples);

    addPIInformation(theseSamples)

  }



  //trigger a popup on the open site
  function triggerPopup(lat, lng){
    //returns true if we need to return  the
      coords = new mapboxgl.LngLat(lng, lat)
      pt = window.map.project(coords)

      //is there anything there?
      var features = window.map.queryRenderedFeatures(pt, { layers: ['points'] });

      if (!features.length) {
          return false;
      }

      var feature = features[0];
      //make sure the popup opens on the point of the symbol, not the point of the event
      coords = new mapboxgl.LngLat(feature.properties.longitude, feature.properties.latitude)
      var popup = new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(createPopupText(feature)) //custom popup function
          .addTo(window.map);
      var UIEvents = require("./events.js");
      UIEvents.enableClickOnPopup();
      return feature
  };

  function createPopupText(feature){
    dsMeta = JSON.parse(feature.properties.datasetMeta);
    html = "<h4><a classs='popup-link' data-siteID=" + dsMeta.Site.SiteID + ">" + dsMeta.Site.SiteName + "</a></h4>"
    return html
  }


  function triggerPopupOnSite(activeSite){
    //where does it go?
      lng = (activeSite.LongitudeWest + activeSite.LongitudeEast) / 2
      lat = (activeSite.LatitudeNorth + activeSite.LatitudeSouth) / 2

      triggerPopup(lat, lng)
  }

  //this function gives ability to programmatically open panel and open the popup so it's just like a regular user event
  function triggerOpen(siteID){
      doOpen(siteID);
      //wait for the map to stop doing stuff
      activeSite = lookupSite(siteID);
      setTimeout(function(d){
        triggerPopup(activeSite)
      }, 1000);
  }

  return {
    open: doOpen,
    triggerPopup: triggerPopup,
    triggerPopupOnSite: triggerPopupOnSite,
    triggerOpen: triggerOpen
  }
})();

module.exports = sitePanel;
