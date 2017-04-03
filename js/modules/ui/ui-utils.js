var toastr = require('toastr');
var _ = require("underscore");
var $ = require("jquery");
var Awesomplete = require("Awesomplete");
var IO;
var utils = require('./../processes/utils.js');

var UIUtils = (function(){
  //UI utility method called when metadata for a shared map is not valid

  function failShareValidation(validationResponse){
    for (var i=0; i < validationResponse.failed.length; i++){
      failed = validationResponse.failed[i];
      toastr.error("Please enter a " + failed + "!", "Metadata Required")
    }
  };


  //callback once the share token has been returned from the server
  function onShareSuccess (data){
    if (data.success){
      toastr.success("Configuration Storage Complete!")
      hash = data['configHash']
      urlString = config.baseURL +"?shareToken="+ hash
      state.shareToken = hash
      $("#shareURL").html("<a href='" + urlString + "'>" + hash + "</a>")
    }else{
      toastr.error("Failed to share map.")
      throw "Failed to sync with map server"
    }
  };

  function createLoadDataWindowComponents(config){
    IO = require("./../processes/io.js"); //this is weird, it fails if we load at beginning of script TODO: fix
    IO.getTaxa(config, onTaxaReceipt);
  }


  function onTaxaReceipt(data, config){
      createTaxaAutocomplete(data);
      window.appData.taxa = data
      //also load the dropdown menus
      IO.getEcolGroups(config, onEcolGroupsReceipt); //pass through the taxa data
  }

  function onEcolGroupsReceipt(data){
    if (data['success']){
      populateEcolGroupDropdown(data['data'], window.appData.taxa);
      window.appData.ecolGroups = data;
    }else{
      displayError("Failed to load remote data source.");
      throw "Failed to load ecological groups";
    }
  }

  //populate the ecological group menu with data
  //used as a callback from the getEcolGroups function
  var populateEcolGroupDropdown = function(data, taxa){
    //populate the ecological groups dropdown menu
    //add a new <option> for each group in the response
    $("#ecolGroupSelect").empty() //clear the list
    for (var i = 0; i < data.length; i++){
      grp = data[i]
      html = "<option value='" + grp['EcolGroupID'] + "'>" + grp['EcolGroup'] + "</option>"
      $("#ecolGroupSelect").append(html)
    }

    //set the attached taxa menu to be a smart default
    filterAndPopulateTaxaDropdown(data[0], taxa)
  }

  var filterAndPopulateTaxaDropdown = function(selectedGroup, taxa){
    console.log(taxa)
    //filter the taxa list to the selected ecological group
    //put the filtered list into the taxa dropdown
    filteredTaxa = _.filter(taxa, function(d){
      return ((d.EcolGroups.indexOf(selectedGroup) > -1))
    })
    //add an <option> to the dropdown for each of the filtered taxa
    $("#taxonSelect").empty()
    for (var i=0; i < filteredTaxa.length; i++){
      t = filteredTaxa[i]
      html = "<option value='" + t['TaxonID'] + "'>" + t['TaxonName']
      if (t['Extinct']){
        html += "  <span class='text-muted'>(extinct) </span>"
      }
      html += "</option>"
      $("#taxonSelect").append(html)
    }
  };


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


  var createTaxaAutocomplete = function(data){
    //populate the search bar, and make it so it autocompletes when a user starts typing
    //add taxa to the data list first
    taxaNames = _.pluck(data, "TaxonName")
    input = document.getElementById("taxaAutocomplete")
    taxaAutocomplete = new Awesomplete(input, {
      list: taxaNames,
      minChars: 2,
      filter: Awesomplete.FILTER_STARTSWITH
    })
    return taxaAutocomplete
  }

  var displayError = function(message, title){
    toastr.warning(message, title);
  }
  var displayInfo = function(message, title){
    toastr.info(message, title);
  }
  var displaySuccess = function(message, title){
    toastr.success(message, title)
  }

  var handleShareRequestEvent = function(){
    metadata = getShareMapMetadata();
    isValid = utils.validateShareMapMetadata(metadata);
    if (isValid.valid){
      IO.sendShareRequest(metadata, onShareRequestSuccess)
    }else{
      for (var i =0; i < isValid.failed.length; i++){
        displayError("You must enter a " + isValid.failed[i] + " to your map!");
      }
    }
  }

  var onShareRequestSuccess = function(data){
      if (data.success){
        displaySuccess("Configuration Storage Complete!")
        hash = data['configHash']
        urlString = window.config.baseURL +"?shareToken="+ hash
        window.state.shareToken = hash
        $("#shareURL").html("<a href='" + urlString + "'>" + hash + "</a>")
      }else{
        displayError("Failed to share map.")
      }
  }

  function applyFilters(state, charts){
    
  }

  return {
    failShareValidation: failShareValidation,
    onShareSuccess: onShareSuccess,
    populateEcolGroupDropdown: populateEcolGroupDropdown,
    filterAndPopulateTaxaDropdown: filterAndPopulateTaxaDropdown,
    createTaxaAutocomplete: createTaxaAutocomplete,
    displayError:displayError,
    displayInfo: displayInfo,
    displaySuccess: displaySuccess,
    createLoadDataWindowComponents: createLoadDataWindowComponents,
    handleShareRequestEvent: handleShareRequestEvent
  }
})();

module.exports = UIUtils;
