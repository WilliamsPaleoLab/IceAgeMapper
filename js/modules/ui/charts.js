var analyticsCharts = (function(){

  var latitudeChart,
      ageChart,
      bubbleChart,
      abundanceChart,
      PIChart,
      recordTypeChart,
      temperatureChart;

  //constructor function for a dc bar chart
  var analyticsBarChart = function(el, xlab, ylab, filterEvent, height, width, margins, elasticY, brushOn){
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

    this._chart = dc.barChart(el)
      .width(width)
      .height(height)
      .margins(margins)
      .elasticY(elasticY)
      .xAxisLabel(xlab)
      .yAxisLabel(ylab)

    if (filterEvent != undefined){
      _chart.on('filtered', filterEvent)
    }
    return this._chart
  }; //end create bar chart function

  //constructor function for a dc bar chart
  var analyticsPieChart = function(el, filterEvent, height, width, margins){
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

    if (filterEvent != undefined){
      _chart.on('filtered', filterEvent)
    }
    return this._chart
  }; //end create pie chart function
  //
  var temperatureChart = function(data,
                                  el,
                                  xLab,
                                  yLab,
                                  filterEvent,
                                  xDomain,
                                  yDomain,
                                  height,
                                  width,
                                  margins){
        //draws the greenland ice core temperature curve
        if (data === undefined){
          throw "Data is a required argument"
        }
        if (el === undefined){
          throw "Element must be defined!"
        }
        if (xLab === undefined){
          throw "X axis label must be defined!"
        }
        if(yLab === undefined){
          throw "Y axis must be defined!"
        }
        if (height == undefined){
          height = $(el).height();
        }
        if(width === undefined){
          width = $(el).width();
        }
        if (margins === undefined){
          margins = {bottom:30,left:50,right:10,top:10}
        }
        if(xDomain === undefined){
          xDomain = [0, 22]
        }
        if(yDomain === undefined){
          yDomain = d3.extent(data, function(d){return +d.TempC})
        }

      this._chart = dc.barChart(el)
            .width(width)
            .height(height)
            .x(d3.scale.linear().domain(xDomain))
            .margins(margins)
            .y(d3.scale.linear().domain(yDomain))
            .brushOn(false)
            .yAxisLabel(yLab, 25)
            .xAxisLabel(xLab)
            .on('renderlet', function(chart) {
                var tempLineFn = d3.svg.line()
                      .x(function(d) { return chart.x()(+d.Age); })
                      .y(function(d) { return chart.y()(+d.TempC); })
                      //get drawing context
                      var chartBody = chart.select('g.chart-body');
                      var path = chartBody.selectAll('path').data([data]);
                      path.enter()
                        .append('path')
                        .attr('d', globals.tempLineFn )
                        .style('fill', 'none')
                        .style('stroke', config.colors.tempCurve)

            // add annotations
            if (config.doAnnotations){
              annotateTempChart(chartBody, chart)
            }
          }) // end renderlet

          if (filterEvent != undefined){
            this._chart.on('filtered', filterEvent)
          }
          globals.elements.tChart.render()
    };

  var annotateTempChart = function(chartBody, chart){
      chartBody.selectAll("text").remove()
      chartBody.append('text')
        .attr('x', chart.x()(18))
        .attr('y', chart.y()(-40))
        .attr('text-anchor', 'middle')
        .text("Deglaciation")
        .style('fill', config.colors.annotations)

        chartBody.append('text')
          .attr('x', chart.x()(14.7))
          .attr('y', chart.y()(-31.7))
          .attr('text-anchor', 'middle')
          .text("Bolling Allerod")
          .style('fill', config.colors.annotations)

          chartBody.append('text')
            .attr('x', chart.x()(8))
            .attr('y', chart.y()(-40))
            .attr('text-anchor', 'end')
            .text("The Holocene")
            .style('fill', config.colors.annotations)

        chartBody.append('text')
          .attr('x', chart.x()(0))
          .attr('y', chart.y()(-34))
          .attr('text-anchor', 'begin')
          .text("Today")
          .style('fill', config.colors.annotations)
  }


  //chart creation functions

  var initializeAnalytics = function(){
    this.latitudeChart =  new analyticsBarChart("#latitudeChart", "Latitude", "Frequency");
    this.ageChart = new analyticsBarChart("#ageChart", "Age (kya)", "Frequency");
    this.abundanceChart = new analyticsBarChart("#abundanceChart", "Absolute Abundance", "Frequency");
    this.PIChart = new analyticsPieChart("#PIChart");
    this.recordTypeChart = new analyticsPieChart("#recordTypeChart")
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
    initializeAnalytics: initializeAnalytics,
    temperatureChart: temperatureChart,
    initializeTemperatureChart: initializeTemperatureChart
  }
})();

module.exports = analyticsCharts;
