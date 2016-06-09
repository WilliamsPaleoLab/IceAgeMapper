//this file makes simulated data for developing the NicheViewer
function makeFakeData(numPoints, numSlices, numLayers, numSources){
  sourceOpts = range(0, numSources)
  response = {
    success: true,
    timestamp : new Date().toUTCString(),
    data: [],
    layerDescriptions: []
  }
  for (var i=0; i<numPoints; i++){
    item = {
      latitude: -999,
      longitude: -999,
      siteName: "FakeSite",
      siteID: getRandomInt(0, 2000),
      slices: {}
    }
    lastYear = -30
    for (var p = 0; p < numSlices; p++){
      ind = getRandomInt(lastYear, lastYear + 5000)
      lastYear = ind
      layers = []
      for (var j=0; j<numLayers; j++){
          layer = createRandomLayer(ind, j)
          layers.push(layer)
      } // end layer creation loop
      item.slices[ind] = layers
    } //end slices
    modern = []
    for (var j=0; j<numLayers; j++){
        layer = createRandomLayer(ind, j)
        modern.push(layer)
    } // end layer creation loop
    item.slices['Modern'] = modern
    response.data.push(item)
  }//end point creation loop
  return response
}//end function

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function createRandomLayer(yearBP, j){
  envName = "SimulatedLayer" + j
  dataSource = "SimulatedSource"
  modifier = getRandomInt(1, 13) //random 'month' modifier
  modiferDescription = "SimulatedMonthModifier" + modifier
  layerDescription = "Simulated data for NicheViewer Development"
  if (yearBP == undefined){
      yearBP = getRandomInt(-30, 20001)
  }
  layer = {
    layerID : j,
    layerSource: dataSource,
    variableName : envName,
    layerModifier : modifier,
    layerDescription: layerDescription,
    modiferDescription : modiferDescription,
    yearsBP: yearBP,
    units: "cm",
    value: getRandomArbitrary(10, 10000)
  }
  return layer
}

function getRandomChoice(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}
