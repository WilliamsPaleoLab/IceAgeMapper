var dc = require("dc");
var IO = require("./../../processes/io.js");
var d3 = require('d3');
var crossfilter = require('crossfilter');

var tempChart = (function(){
  var draw = function(data,
                      el,
                      xLab,
                      yLab,
                      config,
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
            .brushOn(true)
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
                        .attr('d', tempLineFn )
                        .style('fill', 'none')
                        .style('stroke', config.colors.tempCurve)

            // add annotations
            if (config.doAnnotations){
              annotateTempChart(chartBody, chart, config)
            }
          }) // end renderlet

          if (filterEvent != undefined){
            this._chart.on('filtered', filterEvent)
          }

          return this._chart
    };

  var annotateTempChart = function(chartBody, chart, config){
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


  var create = function(config){
    if (config === undefined){
      config = require("./../../config/config.js");
    }
    //load the file and draw the chart
    IO.getTemperatureData(config, function(data){
      var chart = draw(data, "#tempContainer", "Years Before Present", "Mean Temperature", config);
      renderEmpty();
      window.tempChart = chart;
    })
  }

  var changeDimension = function(dimension){
    this._chart.dimension(dimension);
  }

  var changeGroup = function(group){
    this._chart.group(group);
  }

  var render = function(){
    this._chart.render();
  }

  var renderEmpty = function(){
    empty = crossfilter()
    emptyDimension = empty.dimension(function(d){return d});
    emptyGroup = emptyDimension.group().reduceCount();
    changeDimension(emptyDimension);
    changeGroup(emptyGroup);
    this._chart.render();
  }

  return {
    create: create,
    render: render,
    changeDimension:changeDimension,
    changeGroup: changeGroup
  }
})();


module.exports = tempChart
