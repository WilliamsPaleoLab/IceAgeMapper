var utils = (function(){
  var getParameterByName = function(name, url) {
    //get the query parameter values from the URI
      if (!url) {
        url = window.location.href;
      }
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }; //end get parameter by name function

  var lookupSite = function(siteID){
    //pick out the site meta from occurrences with a certain siteID
    site = _.find(appData.occurrences, function(d){return d.siteid == siteID})
    return site.DatasetMeta.Site
  }; //end lookup site


  function lookupSamples(siteID){
    //get the set of SampleData/occurrence objects that are associated with a particular siteID
    samples =_.filter(globals.data.occurrences, {siteid : siteID})
    return samples
  }; //end lookupSamples



  //get details about the person sharing the map
  function getShareMapMetadata(){
    //get metadata
    author = $("#authorName").val();
    org = $("#authorOrg").val();
    mapTitle = $("#mapTitle").val();
    mapDesc = $("#mapDescription").val();

    return {
      author: author,
      organization: org,
      mapTitle: mapTitle,
      mapDesc: mapDesc
    }
  };

  function validateShareMapMetadata(metadata){

  }


  return {
    getParameterByName: getParameterByName,
    lookupSamples:lookupSample,
    lookupSite: lookupSite
  }

})();//end utils module
