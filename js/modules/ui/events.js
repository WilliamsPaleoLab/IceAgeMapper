var IO = require("./../processes/io.js");
var ui = require("./ui.js");
var UIUtils = require("./ui-utils.js");

var UIEvents = (function(){

  var onEcolGroupDropdownChange = function(){
    $("#ecolGroupSelect").change(function(){
      selectedGrp = $("#ecolGroupSelect :selected").val()
      UIUtils.filterAndPopulateTaxaDropdown(selectedGrp, window.appData.taxa);
      window.state.searchSwitch = "browse";
    })
  }

  var onTaxaSearchChange = function(){
    $("#taxaAutocomplete").change(function(){
      window.state.searchSwitch = "search";
    })
  }

  var onSearchButtonClick = function(){
    $("#searchButton").click(function(){
      window.state.taxonname = $("#taxaAutocomplete").val()
      window.state.taxonid = $("#taxonSelect :selected").val()
      IO.getNeotomaData(window.config, window.state, ui.onNeotomDataReceipt)
    })
  }

  var onSendShareRequestButtonClick = function(){
    $("#sendShareRequest").click(function(){
      UIUtils.handleShareRequestEvent();
    })
  }

  function enableAll(){
    onEcolGroupDropdownChange();
    onTaxaSearchChange();
    onSearchButtonClick();
    onSendShareRequestButtonClick();
  }

  return  {
    enableAll: enableAll
  }
})();

module.exports = UIEvents
