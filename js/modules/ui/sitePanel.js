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
    for (var i = 0; i < theseSamples[0].DatasetMeta.DatasetPIs.length; i++){
        thisSitePI = theseSamples[0].DatasetMeta.DatasetPIs[i]
        piTable += "<tr><td>Dataset Investigator: </td><td>" + thisSitePI.ContactName + "</td><tr>"
    }
    if (piTable == ""){
      piTable = "<i>No Investigators Listed</i>"
    }
    $("#pi-table").html(piTable)
  }

  function getTheseSamples(siteID){
    theseSamples = lookupSamples(siteID)
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
    layout.open("west") //open the panel

    theseSamples = getTheseSamples(siteID)


    //add the UI elements
    addSiteMetadata(state.activeSite)

    addDataTable(theseSamples);

    addPIInformation(theseSamples)

  }

  //trigger a popup on the open site
  function triggerPopup(activeSite){

    //where does it go?
      lng = (activeSite.LongitudeWest + activeSite.LongitudeEast) / 2
      lat = (activeSite.LatitudeNorth + activeSite.LatitudeSouth) / 2

      coords = new mapboxgl.LngLat(lng, lat)
      pt = ui.map.project(coords)

      //is there anything there?
      var features = ui.map.queryRenderedFeatures(pt, { layers: ['points'] });

      if (!features.length) {
          return;
      }

      var feature = features[0];
      //make sure the popup opens on the point of the symbol, not the point of the event
      coords = new mapboxgl.LngLat(feature.properties.longitude, feature.properties.latitude)

      var popup = new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(config.map.popupTextFunction(feature)) //custom popup function
          .addTo(ui.map);
  };

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
    triggerOpen
  }
})();

module.exports = sitePanel;
