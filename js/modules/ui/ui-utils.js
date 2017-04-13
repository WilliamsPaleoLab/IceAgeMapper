var toastr = require('toastr');
var _ = require("underscore");
var $ = require("jquery");
var Awesomplete = require("Awesomplete");
var IO;
var utils = require('./../processes/utils.js');
var dc = require("dc");
var icesheets = require('./icesheets.js');

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

  var displayEmptySet = function(){
    displayError("No records found!", "Error.")
  }

  var displayWebGLError = function(){
    $("body").append("<div class='failed'><h4 class='page-header'>It appears your browser is not properly configured to use this application. Please check to make sure that you ahve WebGL enabled in your browser.</div>")
  }



  var handleShareRequestEvent = function(){

    //close the timer
    window.config.timer.sessionEnd = new Date();
    utils.calcElapsedTime();

    metadata = getShareMapMetadata();
    isValid = utils.validateShareMapMetadata(metadata);
    //update the state with current filters

    window.state.filters.age = window.charts.ageChart.filter();
    window.state.filters.abudance = window.charts.abundanceChart.filter();
    window.state.filters.recordType = window.charts.recordTypeChart.filter();
    window.state.filters.latitude = window.charts.latitudeChart.filter();
    window.state.filters.investigator = window.charts.PIChart.filter();
    window.state.filters.age = window.charts.temperatureChart.filter(); //overwrites age filter, but they're the same dimension.


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
    //apply saved filters to new UI
    console.log(state.filters);
    charts.ageChart.filter(state.filters.age);
    charts.abundanceChart.filter(state.filters.abundance);
    charts.latitudeChart.filter(state.filters.latitude);
    charts.PIChart.filter(state.filters.investigator);
    charts.temperatureChart.filter(state.filters.age);
    charts.recordTypeChart.filter(state.filters.recordType);
    charts.temperatureChart.filter(state.filters.age)
    dc.renderAll();
  }

  function checkForWebGLSupport(){
    try {
        var canvas = document.createElement("canvas");
        return !!
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl"));
    } catch(e) {
        return false;
    }
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
    displayEmptySet: displayEmptySet,
    createLoadDataWindowComponents: createLoadDataWindowComponents,
    handleShareRequestEvent: handleShareRequestEvent,
    applyFilters: applyFilters,
    checkForWebGLSupport: checkForWebGLSupport,
    displayWebGLError: displayWebGLError
  }
})();

module.exports = UIUtils;
