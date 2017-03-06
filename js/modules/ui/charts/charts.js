var dc = require('dc');
var d3 = require('d3');

var analyticsCharts = (function(){

  var latitudeChart,
      ageChart,
      bubbleChart,
      abundanceChart,
      PIChart,
      recordTypeChart,
      temperatureChart;

  //constructor function for a dc bar chart
  var analyticsBarChart = function(el,
    xlab,
    ylab,
    dimension,
    group,
    attribute,
    height,
    filterEvent,
    width,
    margins,
    elasticY,
    brushOn){
    if (el === undefined){
      throw "Element must be defined!"
      return false
    }
    if(xlab === undefined){
      throw "Chart must have an X axis label!"
      return false
    }
    if (ylab === undefined){
      throw "Chart must have a Y axis label!"
      return false
    }
    if (height === undefined){
      var height = $(el).height();
    }
    if(width === undefined){
      var width = $(el).width();
    }
    if(margins === undefined){
      var margins = {bottom: 30, top: 10, left: 30, right: 25}
    }
    if (elasticY === undefined){
      var elasticY = true;
    }
    if(brushOn === undefined){
      var brushOn = true;
    }

    var xScale = createScale(dimension, attribute)

    this._chart = dc.barChart(el)
      .width(width)
      .height(height)
      .margins(margins)
      .elasticY(elasticY)
      .xAxisLabel(xlab)
      .yAxisLabel(ylab)
      .dimension(dimension)
      .group(group)
      .x(xScale);

    if (filterEvent != undefined){
      _chart.on('filtered', filterEvent)
    }
    return this._chart
  }; //end create bar chart function

  //constructor function for a dc bar chart
  var analyticsPieChart = function(el, dimension, group, filterEvent, height, width, margins){
    if (el === undefined){
      throw "Element must be defined!"
      return false
    }
    if (height === undefined){
      var height = $(el).height();
    }
    if(width === undefined){
      var width = $(el).width();
    }
    if(margins === undefined){
      var margins = {bottom: 30, top: 10, left: 30, right: 25}
    }

    this._chart = dc.pieChart(el)
      .width(width)
      .height(height)
      .dimension(dimension)
      .group(group)

    if (filterEvent != undefined){
      _chart.on('filtered', filterEvent)
    }
    return this._chart
  }; //end create pie chart function
  //

  function createScale(dimension, attr){
    var scale = d3.scale.linear().domain(d3.extent(dimension.top(Infinity), function(d){return d[attr]}));
    return scale
  }


  //chart creation functions

  var create = function(dimensions, groups){
    console.log(dimensions)
    console.log(groups)
    this.latitudeChart =  new analyticsBarChart("#latitudeChart", "Latitude", "Frequency", dimensions.latitudeDimension, groups.latitudeGroup, "latitude");
    this.ageChart = new analyticsBarChart("#ageChart", "Age (kya)", "Frequency", dimensions.ageDimension, groups.ageGroup, "age");
    this.abundanceChart = new analyticsBarChart("#abundanceChart", "Absolute Abundance", "Frequency", dimensions.valueDimension, groups.valueGroup, "Value");
    this.PIChart = new analyticsPieChart("#PIChart", dimensions.piDimension, groups.piGroup);
    this.recordTypeChart = new analyticsPieChart("#recordTypeChart", dimensions.recordTypeDimension, groups.recordTypeGroup)
    return this
  }

  var initializeTemperatureChart = function(data){
    this.temperatureChart = new temperatureChart(data, "#temperatureChart", "Age (kya)", "Mean Temperature")
  }

  return {
    latitudeChart: latitudeChart,
    ageChart: ageChart,
    abundanceChart: abundanceChart,
    PIChart: PIChart,
    recordTypeChart: recordTypeChart,
    create: create,
  }
})();

module.exports = analyticsCharts;
