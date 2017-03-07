var UIUtils = require("./ui-utils.js");

var UIEvents = (function(){

  var onEcolGroupDropdownChange = function(){
    $("#ecolGroupSelect").change(function(){
      selectedGrp = $("#ecolGroupSelect :selected").val()
      UIUtils.filterAndPopulateTaxaDropdown(selectedGrp, window.appData.taxa)
    })
  }

  // var onSearchButtonClick = function(){
  //   $("#")
  // }

  function enableAll(){
    onEcolGroupDropdownChange();
  }

  return  {
    enableAll: enableAll
  }
})();

module.exports = UIEvents
