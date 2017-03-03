var filters = (function(){

  function filterIceSheets(age){
    // closestSlice = globals.data.iceTimeSlices.closest(age)
    // if (globals.map.loaded()){
    //     globals.map.setFilter('icesheets', ['==', 'Age', closestSlice])
    // }else{
    //   globals.map.on('load', function(){
    //     globals.map.setFilter('icesheets', ['==', 'Age', closestSlice])
    //   })
    // }
  };


  function checkFilter (filter){
    if((filter != null) && (filter != undefined)){
      return true
    }
    return false
  }

  var applyFilters = function(){
    //returns whether or not we redraw all the charts
    //true -- did the redraw
    //false -- didn't do the redraw

    // //only trigger redraw if we need it
    // var _needsUpdate = false
    //
    // //latitude chart
    // if (checkFilter()){
    //   globals.elements.latitudeChart.filter(globals.state.filters.latitude);
    //   _needsUpdate = true;
    // }
    //
    // //abundanceChart
    // if ((globals.state.filters.abundance != null) && (globals.state.filters.abundance != undefined)){
    //   globals.elements.abundanceChart.filter(globals.state.filters.abundance);
    //   _needsUpdate = true;
    // }
    //
    //
    // //bubbleChart
    // if ((globals.state.filters.singleSite != null) && (globals.state.filters.singleSite != undefined)){
    //   globals.elements.bubbleChart.filter(globals.state.filters.singleSite);
    //   _needsUpdate = true;
    // }
    //
    // //bubbleChart
    // if ((globals.state.filters.investigator != null) && (globals.state.filters.investigator != undefined)){
    //   globals.elements.PIChart.filter(globals.state.filters.investigator);
    //   _needsUpdate = true;
    // }
    //
    // //bubbleChart
    // if ((globals.state.filters.recordType != null) && (globals.state.filters.recordType != undefined)){
    //   globals.elements.recordTypeChart.filter(globals.state.filters.recordType);
    //   _needsUpdate = true;
    // }
    //
    //
    // globals.elements.mapChart.doFilter();
    // dc.renderAll();

    // return _needsUpdate
  }
  return {
    filterIceSheets: filterIceSheets,
    applyFilters: applyFilters
  }
})()


module.exports = filters;
