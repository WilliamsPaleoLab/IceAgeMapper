console.log("Running heatmap.js version 1");
globals.heatmap = true;
globals.mapLayers = [];
globals.TotalField = "Total"
$(document).ready(function(){
  console.log("Document ready in heatmap.js")
  //create leaflet map
  createMap();
  //initially load sequoia
  //CSVtoHeatmap("/PaleoPortal/testing-data/tsuga_presence.csv")

})

heatOptions = {
  radius: 17,
  minOpacity: 0.5,
  max: 100,
  blur: 25,
}

function createMap(){
  console.log("Map created.")
  globals.map = L.map('map').setView([39.833333, -98.583333], 4);
  var Esri_WorldTerrain = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
  	attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
  	maxZoom: 8
  }).addTo(globals.map);

}


function CSVtoHeatmap(filename){
  //get the radius size
  globals.heatmapRadius = $("#spatial-window-select").val();

  //load the data
  d3.csv(filename, function(data){
    globals.data = data;
    //prep for heatmapping
    dataset = _.filter(data, function(d){
      return ((+d.age > globals.minYear) && (+d.age <= globals.maxYear));
    })
    dataset = _.map(dataset, function(d){
      return [+d.latitude, +d.longitude, +d.pollenPercentage];
    })
    globals.heatmapData = dataset
    createHeatmap(dataset, 25);
    updateHeatmap();
  })
}

function createHeatmap(dataset, radius){
  //clear existing layers
  console.log("Creating heatmap!")
  var heat = L.heatLayer([], heatOptions);
  heat.addTo(globals.map);
  globals.mapLayers.push(heat);
  globals.heat = heat;
}

$("#spatial-window-select").change(function(){
  globals.heatmapRadius = radius;
  globals.heat.setOptions(heatOptions);
  globals.heat.redraw();
})

function updateHeatmap(){
  //update the data array
  dataset = _.filter(globals.data, function(d){
    if ((+d.Age == null) || (+d.Age == "")){
      d.Age = (+d.AgeOlder + d.AgeYounger)/2
    }
    return ((+d.Age > globals.minYear) && (+d.Age <= globals.maxYear));
  })
  dataset = _.map(dataset, function(d){
    pollenPercentage = (d['Value'] / d[globals.TotalField]) * 100
    return [(+d.LatitudeNorth + +d.LatitudeSouth)/2, (+d.LongitudeEast + +d.LongitudeWest)/2, pollenPercentage];
  })
  globals.heatmapData = dataset;
  globals.heat.setLatLngs(dataset);
  globals.heat.redraw();
}

function APIToHeatmap(taxon){
  $.ajax("http://apidev.neotomadb.org/v1/data/pollen?taxonname=" + taxon, {
     beforeSend: function(){
       console.log(this.url)
     },
     error: function(xhr, status, error){
       console.log(xhr)
       console.log(status)
       console.log(error)
     },
     dataType: "jsonp",
     success: function(data){
       console.log("Success!")
       if (data['success']){
        globals.data = dataset= data['data']
         console.log(dataset)
         globals.heatmapData = dataset
         createHeatmap(dataset, 25);
         updateHeatmap();
       }
     }
  })
}

$("#searchButton").on('click', function(){
  taxon = $("#searchBar").val()
  console.log("Searching neotoma for: " + taxon)
  APIToHeatmap(taxon)
})
