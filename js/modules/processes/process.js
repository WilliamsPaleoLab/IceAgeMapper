var processes = (function(){
  var mergeMeta = function(callback){

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



  return {
    mergeMetadata: mergeMeta;
  }
})
