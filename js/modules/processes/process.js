var crossfilter = require("crossfilter");
var mapboxgl = require('mapbox-gl')



var processes = (function(){

  function mergeMetadata(occurrences, datasets){

    var processedAndValidated = new Array()

    //depends on having arrays for occurrences and metadata
    for (var i=0; i < occurrences.length; i++){
      for (var j=0; j < datasets.length; j++){
        occ = occurrences[i];
        dat = datasets[j];
        datID = dat.DatasetID
        occID = occ.DatasetID
        if (datID == occID){ //if the
          var validatedOccurrence = processRow(occ, dat)
          if (validatedOccurrence){
            processedAndValidated.push(validatedOccurrence)
          }
        }
      }
    }
    return processedAndValidated;
  }; // end mergeMeta

  function processRow(occurrence, dataset){
    //add necessary metadata
    //derive properties so they're easier to access later with underscore
    occurrence.datasetMeta = dataset
    console.log(occurrence);
    occurrence.latitude = (occurrence.SiteLatitudeNorth + occurrence.SiteLatitudeSouth)/2
    occurrence.longitude = (occurrence.SiteLongitudeWest + occurrence.SiteLongitudeEast)/2
    occurrence.age = occurrence.SampleAge
    occurrence.ageUncertainty = 0
    occurrence.altitude = occurrence.datasetMeta.Site.Altitude
    if (occurrence.age == null){
      occurrence.age = (occurrence.SampleAgeYounger + occurrence.SampleAgeOlder)/2
      occurrence.ageUncertainty = (occurrence.SampleAgeOlder - occurrence.SampleAgeYounger) / 2
    }

    if (occurrence.datasetMeta.DatasetPIs.length == 0){
      occurrence.piName =  "None Listed" ;
    }else{
      occurrence.piName = occurrence.datasetMeta.DatasetPIs[0].ContactName
    }
    occurrence.recordType = occurrence.VariableUnits

    occurrence.siteid = occurrence.datasetMeta.Site.SiteID;

    var _isValidRow = validateRow(occurrence)
    if (_isValidRow){
        return occurrence;
    }
    return false;
  }



  function validateRow(row){
    //check that the values can be included in crossfilter
    var _valid = new Array();
    _valid.push(validateField(row.altitude))
    _valid.push(validateField(row.latitude))
    _valid.push(validateField(row.longitude))
    _valid.push(validateField(row.age))
    if (_valid.indexOf(false) > -1){
      return false
    }
    return true
  }

  function validateField(fieldValue){
    if (fieldValue == null || fieldValue == undefined || +fieldValue == NaN ){
      return false
    }
    return true
  }

  function crossfilterIt(data, nameArray){
    var cf = crossfilter(data);
    var dimensions = createCrossfilterDimensions(cf)
    var groups = createCrossfilterGroups(dimensions)
    return {
      dimensions: dimensions,
      groups: groups,
      cf: cf
    }
  }

  function createCrossfilterDimensions(cf){
    var dimensions = {}
    dimensions.valueDimension = cf.dimension(function(d){return d.Value});
    dimensions.ageDimension = cf.dimension(function(d){return Math.round(d.age/1000)*1000});
    dimensions.latitudeDimension = cf.dimension(function(d){return Math.round(d.latitude/0.5)*0.5});
    dimensions.piDimension = cf.dimension(function(d){return d.piName});
    dimensions.geoDimension = cf.dimension(function(d){return new mapboxgl.LngLat(d.longitude, d.latitude)});
    dimensions.recordTypeDimension = cf.dimension(function(d){return d.recordType});
    dimensions.taxaDimension = cf.dimension(function(d){return d.TaxonName});
    return dimensions
  }

  function createCrossfilterGroups(dimensions){
    console.log(dimensions)
    var groups = {}
    groups.valueGroup = dimensions.valueDimension.group(function(d){
        return Math.round(d/1) * 1 //for making bin sizes
      }).reduceCount()

    groups.ageGroup = dimensions.ageDimension.group(function(d){
      return Math.round(d/1000)*1000
    }).reduceCount()

    groups.latitudeGroup = dimensions.latitudeDimension.group(function(d){
      return Math.round(d/0.5)*0.5
    }).reduceCount();

    groups.piGroup = dimensions.piDimension.group().reduceCount();
    groups.recordTypeGroup = dimensions.recordTypeDimension.group().reduceCount();
    groups.geoGroup = dimensions.geoDimension.group().reduceCount();
    groups.taxaGroup = dimensions.taxaDimension.group().reduceCount();

    return groups
  }







  return {
    mergeMetadata: mergeMetadata,
    crossfilterIt: crossfilterIt
  }
})();


module.exports = processes;
