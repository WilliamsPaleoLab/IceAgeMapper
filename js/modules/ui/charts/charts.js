var dc = require('dc');
var d3 = require('d3');
var icesheets = require('./../icesheets.js');

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
    xUnits,
    height,
    width,
    filterEvent,
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
      height = $(el).height();
      if (height < 250){
        //create the charts even if the window is closed
        height = 200
      }
    }
    if(width === undefined){
      width = $(el).width();
      if (width  < 250){
        //create the charts even if the window is closed
        width = 250
      }
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

      this._chart.xUnits(function(start, end, xDomain) { return (end - start) / xUnits; })

    if (filterEvent != undefined){
      this._chart.on('filtered', filterEvent)
    }
    return this._chart
  }; //end create bar chart function

  //constructor function for a dc bar chart
  var analyticsPieChart = function(el, dimension, group, scale, filterEvent, height, width, margins){
    if (el === undefined){
      throw "Element must be defined!"
      return false
    }
    if (height === undefined){
      var height = $(el).height();
      if (height == 0){
        //create the charts even if the window is closed
        height = 200
      }
    }
    if(width === undefined){
      var width = $(el).width();
      if (width == 0){
        //create the charts even if the window is closed
        width = 250
      }
    }
    if(margins === undefined){
      var margins = {bottom: 30, top: 10, left: 30, right: 25}
    }

    this._chart = dc.pieChart(el)
      .width(width)
      .height(height)
      .dimension(dimension)
      .group(group)

    if (scale != undefined){
      this._chart.colors(scale);
    }

    if (filterEvent != undefined){
      this._chart.on('filtered', filterEvent)
    }


    return this._chart
  }; //end create pie chart function
  //

  function createScale(dimension, attr){
    var scale = d3.scale.linear().domain(d3.extent(dimension.top(Infinity), function(d){return d[attr]}));
    return scale
  }

  function onAgeFilter(t, f){
    if (f != null){
      setTimeout(function(d){
          icesheets.filterFromRange(f);
      }, 100)
    }
  }

  //chart creation functions
  var create = function(dimensions, groups){
    var recordTypeScale = d3.scale.ordinal().range(["#1b9e77", "#d95f02", "#7570b3"]).domain(["present/absent", "NISP", "MNI"])
    this.latitudeChart =  new analyticsBarChart("#latitudeChart", "Latitude", "Frequency", dimensions.latitudeDimension, groups.latitudeGroup, "latitude", 0.5);
    this.ageChart = new analyticsBarChart("#ageChart", "Age (kya)", "Frequency", dimensions.ageDimension, groups.ageGroup, "age", 1000, undefined, undefined, onAgeFilter);
    this.abundanceChart = new analyticsBarChart("#abundanceChart", "Absolute Abundance", "Frequency", dimensions.valueDimension, groups.valueGroup, "Value", 1);
    this.PIChart = new analyticsPieChart("#PIChart", dimensions.piDimension, groups.piGroup);
    this.recordTypeChart = new analyticsPieChart("#recordTypeChart", dimensions.recordTypeDimension, groups.recordTypeGroup, recordTypeScale)
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
