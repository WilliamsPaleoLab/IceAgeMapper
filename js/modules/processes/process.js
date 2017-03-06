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
    occurrence.latitude = (occurrence.SiteLatitudeNorth + occurrence.SiteLatitudeSouth)/2
    occurrence.longitude = (occurrence.SiteLongitudeWest + occurrence.SiteLongitudeEast)/2
    occurrence.age = occurrence.SampleAge
    occurrence.ageUncertainty = 0
    if (occurrence.age == null){
    occurrence.age = (occurrence.SampleAgeYounger + occurrence.SampleAgeOlder)/2
    occurrence.ageUncertainty = (occurrence.SampleAgeOlder - occurrence.SampleAgeYounger) / 2
    }

    if (occurrence.datasetMeta.DatasetPIs.length == 0){
      occurrence.datasetMeta.DatasetPIs.push({ContactName: "None Listed"});
    }

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
    if (_valid.indexOf(false) > 0){
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







  return {
    mergeMetadata: mergeMetadata
  }
})();


module.exports = processes;
