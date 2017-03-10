
var _ = require("underscore");
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
    console.log(siteID)
    console.log(window.appData.occurrences)
    site = _.find(window.appData.occurrences, function(d){return d.siteid == siteID})
    return site.datasetMeta.Site
  }; //end lookup site


  function lookupSamples(siteID){
    //get the set of SampleData/occurrence objects that are associated with a particular siteID
    samples =_.filter(window.appData.occurrences, {siteid : siteID})
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
    if (isNaN(+taxonid)){
      return false
    }
    if (+taxonid < 0){
      return false;
    }
    return true;
  }

  //validate the map metaddata to ensure it's got the required elements
  function validateShareMapMetadata(metadata, config){
    if (config){
      var authorRequired = config.validationRules.authorRequired;
      var organizationRequired = config.validationRules.organizationRequired;
      var titleRequired = config.validationRules.titleRequired;
      var descriptionRequired = config.validationRules.descriptionRequired;
    }else{
      var authorRequired = true;
      var organizationRequired = true;
      var titleRequired = true;
      var descriptionRequired = true;
    }

    response = {
      valid: false,
      failed: []
    }
    if (authorRequired){
      if ((metadata.author === undefined) || (metadata.author == "") || (metadata.author == null)){
        response.failed.push("Author")
      }
    };
    if (organizationRequired){
      if ((metadata.organization === undefined) || (metadata.organization == "") || (metadata.organization == null)){
        response.failed.push("Organization")
      }
    };
    if (titleRequired){
      if ((metadata.mapTitle === undefined) || (metadata.mapTitle == "") || (metadata.mapTitle == null)){
        response.failed.push("Title")
      }
    };
    if (descriptionRequired){
      if ((metadata.mapDescription === undefined) || (metadata.mapDescription == "") || (metadata.mapDescription == null)){
        response.failed.push("Description")
      }
    };
    if (response.failed.length == 0){
      response.valid = true
    }
    return response
  }


  //generate the GET request URL for the shared map
  var createShareLink = function(metadata, host, config){
    if (config == undefined){
      config = window.config
    }
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
    validateShareMapMetadata: validateShareMapMetadata,
    isValidToken: isValidToken,
    isValidTaxonName: isValidTaxonName,
    isValidTaxonID: isValidTaxonID,
    createShareLink : createShareLink
  }

})();//end utils module


module.exports = utils;
