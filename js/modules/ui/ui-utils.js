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

  //populate the ecological group menu with data
  //used as a callback from the getEcolGroups function
  var populateEcolGroupDropdown = function(data){
    //populate the ecological groups dropdown menu
    //add a new <option> for each group in the response
    appData.ecolGroups = data
    $("#ecolGroupSelect").empty() //clear the list
    for (var i = 0; i < appData.ecolGroups.length; i++){
      grp = appData.ecolGroups[i]
      html = "<option value='" + grp['EcolGroupID'] + "'>" + grp['EcolGroup'] + "</option>"
      $("#ecolGroupSelect").append(html)
    }

    //set the attached taxa menu to be a smart default
    filterAndPopulateTaxaDropdown(appData.ecolGroups[0])
  }

  var filterAndPopulateTaxaDropdown = function(selectedGroup){
    //filter the taxa list to the selected ecological group
    //put the filtered list into the taxa dropdown
    filteredTaxa = _.filter(appData.taxa, function(d){
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


  var createTaxaAutocomplete = function(){
    //populate the search bar, and make it so it autocompletes when a user starts typing
    //add taxa to the data list first
    taxaNames = _.pluck(appData.taxa, "TaxonName")
    input = document.getElementById("taxaAutocomplete")
    taxaAutocomplete = new Awesomplete(input, {
      list: taxaNames,
      minChars: 2,
      filter: Awesomplete.FILTER_STARTSWITH
    })
    return taxaAutocomplete
  }

  var addData = function(){
    crossFilterData() //prepare data for filtering and plotting with crossfilter library

    //callbacks to be completed once data has been processed
   createAnalyticsCharts() //setup visual analytics charts on the righthand panel

    datafyAnalyticsCharts() //update charts with data


   dc.renderAll(); //render the charts
   dc.redrawAll();


   //apply filters, if they're in the configuration object
   applyFilters()

   globals.state.doSearch = true //data is on the map, reflect in state so it will be automatically loaded if the configuration is shared

   //open the site panel if required by config
   doOpenSitePanel()


   //this is hacky
   //TODO: I don't think there's another event that makes this better
   setTimeout(globals.elements.mapChart.doFilter, 1000)
  }


  return {
    failShareValidation: failShareValidation,
    onShareSuccess: onShareSuccess,
    populateEcolGroupDropdown: populateEcolGroupDropdown,
    filterAndPopulateTaxaDropdown: filterAndPopulateTaxaDropdown,
    createTaxaAutocomplete: createTaxaAutocomplete
  }
})();

module.exports = UIUtils;
