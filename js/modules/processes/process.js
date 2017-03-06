var processes = (function(){
  var mergeMeta = function(occurrences, datasets, callback){

    //depends on having arrays for occurrences and metadata
    for (var i=0; i < appData.occurrences.length; i++){
      for (var j=0; j < appD.datasetMeta.length; j++){
        occ = appData.occurrences[i];
        dat = appData.datasetMeta[j];
        datID = dat['DatasetID']
        occID = occ['DatasetID']
        if (datID == occID){
          occ['DatasetMeta'] = dat
          appData.occurrences[i] = occ
          if (+dat.Site.Altitude > -1){
            appData.occurrences[i].altitude = +dat.Site.Altitude
          }else{
            appData.occurrences[i].altitude = 0 //TODO: remove?
          }
        }
      }
    }
    if (appData.occurrences.length != 0){
        callback()
    }
  };

  //make sure that data from the neotoma server is in the right format
  //derive properties so they're easier to access
  //should be called after the metadata has been merged
  function validateNeotomaData(){
    internalID = 0
    for (var i=0; i < appData.occurrences.length; i++){
       lat = (appData.occurrences [i]['SiteLatitudeNorth'] + appData.occurrences [i]['SiteLatitudeSouth'])/2
       lng = (appData.occurrences[i]['SiteLongitudeWest'] + appData.occurrences [i]['SiteLongitudeEast'])/2
       appData.occurrences [i]['latitude'] = lat
       appData.occurrences[i]['longitude'] = lng
      appData.occurrences[i]['age'] = appData.occurrences[i]['SampleAge']
       if (appData.occurrences[i]['age'] == null){
         appData.occurrences[i]['age'] = (appData.occurrences[i]['SampleAgeYounger'] + appData.occurrences[i]['SampleAgeOlder'])/2
       }
       appData.occurrences[i]._id = internalID
       appData.occurrences[i].siteid = appData.occurrences[i].DatasetMeta.Site.SiteID

       //check that the values can be included in crossfilter
       if (appData.occurrences[i].altitude == null || appData.occurrences[i].altitude == undefined || +appData.occurrences[i].altitude == NaN ){
         appData.altitude = -9999;
       }
       if (appData.occurrences[i].latitude == null || appData.occurrences[i].latitude == undefined || +appData.occurrences[i].latitude == NaN ){
         appData.latitude = -9999;
       }
       if (appData.occurrences[i].longitude == null || appData.occurrences[i].longitude == undefined || +appData.occurrences[i].longitude == NaN ){
         appData.longitude = -9999;
       }
       if (appData.occurrences[i].age == null || appData.occurrences[i].age == undefined || +appData.occurrences[i].age == NaN ){
         appData.age = -9999;
       }
       internalID += 1
     }
  }




  return {
    mergeMetadata: mergeMeta,
    validateNeotomaData: validateNeotomaData
  }
})


module.exports = processes;
