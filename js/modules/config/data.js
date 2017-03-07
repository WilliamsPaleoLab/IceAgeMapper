//this is where the data from remote sources laoded via ajax is stored
var appData = (function(){

  var blank = {
    taxa: [],
    ecolGroups: [],
    occurrences: [],
    iceTimeSlices: [],
    datasetMeta: [],
    icesheets: [],
    tempDat: []
  }

  function create(){
    return blank
  }

  return {
    create: create
  }
})();

module.exports = appData;
