console.log("Running heatmap.js version 1");
globals.heatmap = true;
globals.mapLayers = [];
$(document).ready(function(){
  console.log("Document ready in heatmap.js")
  //create leaflet map
  createMap();
  //initially load sequoia
  CSVtoHeatmap("/testing-data/sequoia_with_climate.csv")

})

function createMap(){
  console.log("Map created.")
  globals.map = L.map('map').setView([39.833333, -98.583333], 4);

  var Esri_WorldTerrain = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
  	attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
  	maxZoom: 13
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
  })
}

function createHeatmap(dataset, radius){
  //clear existing layers
  var heat = L.heatLayer([], {radius: radius});
  heat.setLatLngs(dataset)
  heat.addTo(globals.map);
  globals.mapLayers.push(heat);
  globals.heat = heat;
}

$("#spatial-window-select").change(function(){
  radius = $(this).val()
  globals.heatmapRadius = radius;
  globals.heat.setOptions({radius: radius});
  globals.heat.redraw();
})

function updateHeatmap(){
  //update the data array
  dataset = _.filter(globals.data, function(d){
    return ((+d.age >= globals.minYear) && (+d.age < globals.maxYear))
  })
  dataset = _.map(dataset, function(d){
    return [+d.latitude, +d.longitude, +d.pollenPercentage];
  })
  globals.heatmapData = dataset;
  globals.heat.setLatLngs(dataset);
  globals.heat.setOptions({radius: globals.heatmapRadius});
  globals.heat.redraw();
}
