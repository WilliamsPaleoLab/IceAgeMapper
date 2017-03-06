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

  function isValidToken(token){
    //checks if a share token is valid
    if (token === null){
      return false
    }
    if(token === undefined){
      return false
    }
    if ((token.length == 9)){
      return true
    }
    return false
  };

  function isValidTaxonName(taxonname){
    if (taxonname === ""){
      return false
    }
    if (taxonname === null){
      return false
    }
    if (taxonname === undefined){
      return false
    }
    return true;
  }
  function isValidTaxonID(taxonid){
    if (taxonid === ""){
      return false
    }
    if (taxonid === null){
      return false
    }
    if (taxonid === undefined){
      return false
    }
    if (+taxonid === NaN){
      return false
    }
    return true;
  }



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
      mapDescription: mapDesc
    }
  };

  //validate the map metaddata to ensure it's got the required elements
  function validateShareMapMetadata(metadata){
    response = {
      valid: false,
      failed: []
    }
    if (config.validationRules.authorRequired){
      if ((metadata.author === undefined) || (metadata.author == "") || (metadata.author == null)){
        response.failed.push("Author")
      }
    };
    if (config.validationRules.organizationRequired){
      if ((metadata.organization === undefined) || (metadata.organization == "") || (metadata.organization == null)){
        response.failed.push("Organization")
      }
    };
    if (config.validationRules.titleRequired){
      if ((metadata.mapTitle === undefined) || (metadata.mapTitle == "") || (metadata.mapTitle == null)){
        response.failed.push("Title")
      }
    };
    if (config.validationRules.descriptionRequired){
      if ((metadata.mapDescription === undefined) || (metadata.mapDescription == "") || (metadata.mapDescription == null)){
        response.failed.push("Description")
      }
    };
    if (response.failed.length == 0){
      response.valid = 0
    }
    return response
  }


  //generate the GET request URL for the shared map
  function createShareLink(metadata, host){
    if (host === undefined){
      host = config.dataSources.configStore;
    }
    author = encodeURIComponent(metadata.author)
    org = encodeURIComponent(metadata.organization)
    title = encodeURIComponent(metadata.mapTitle)
    desc = encodeURIComponent(metadata.mapDescription)

    uri = host + "?author=" + author + "&organization=" + org + "&title=" + title + "&description=" + desc
    return uri
  }


  return {
    getParameterByName: getParameterByName,
    lookupSamples:lookupSamples,
    lookupSite: lookupSite,
    createShareLink: createShareLink,
    validateShareMapMetadata: validateShareMapMetadata,
    getShareMapMetadata: getShareMapMetadata,
    isValidToken: isValidToken,
    isValidTaxonName: isValidTaxonName,
    isValidTaxonID: isValidTaxonID
  }

})();//end utils module


module.exports = utils;
