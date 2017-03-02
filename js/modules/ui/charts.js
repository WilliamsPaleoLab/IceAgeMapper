var analyticsCharts = {
  this.abundanceChart,
  this.latitudeChart,
  this.ageChart,
  this.investigatorChart,
  this.recordTypeChart,
  this.temperatureChart,
  this.sumamryChart,


  //constructor function for a dc bar chart
  createBarChart = function(el, xlab, ylab, filterEvent, height, width, margins, elasticY, brushOn){
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

    _chart = dc.barChart(el)
      .width(width)
      .height(height)
      .margins(margins)
      .elasticY(elasticY)
      .xAxisLabel(xlab)
      .yAxisLabel(ylab)

    if (filterEvent != undefined){
      _chart.on('filtered', function(chart, filter){
          filterEvent
      })
    }
    return _chart
  }, //end create bar chart function

  //constructor function for a dc bar chart
  createPIChart = function(el, filterEvent, height, width, margins){
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

    _chart = dc.piChart(el)
      .width(width)
      .height(height)
      .margins(margins)
      .elasticY(elasticY)
      .xAxisLabel(xlab)
      .yAxisLabel(ylab)

    if (filterEvent != undefined){
      _chart.on('filtered', function(chart, filter){
          filterEvent
      })
    }
    return _chart
  }, //end create bar chart function




  //chart creation functions

  createLatitudeChart = function(el, filterEvent, height, width, margins){
    this.latitudeChart =
    return this.latitudeChart
  }, // end latitude creation function


  createAgeChart = function(el, filterEvent, height, width, margins){
    if (height === undefined){
      var height = $(el).height();
    }
    if(width === undefined){
      var width = $(el).width();
    }
    if(margins === undefined){
      var margins = {bottom: 30, top: 10, left: 30, right: 25}
    }

    this.ageChart = dc.barChart(el)
        .width(width)
        .height(height)
        .margins(margins)
        .elasticY(true)
        .xAxisLabel("kya")
        .yAxisLabel("Frequency")

    if (filterEvent != undefined){
      this.ageChart.on('filtered', filterEvent)
    }

    return this.ageChart
  }, //end of age chart create function

  createAbundanceChart = function(el, filterEvent, height, width, margins){
    if (height === undefined){
      var height = $(el).height();
    }
    if(width === undefined){
      var width = $(el).width();
    }
    if(margins === undefined){
      var margins = {bottom: 30, top: 10, left: 30, right: 25}
    }

    this.abundanceChart = dc.barChart(el)
        .width(width)
        .height(height)
        .margins(margins)
        // .brushOn(true)
        .elasticY(true)
        .xAxisLabel("Relative Abundance")
        .yAxisLabel("Frequency")

    if (filterEvent != undefined){
      this.abundanceChart.on('filtered', filterEvent)
    }

    return this.abundanceChart
  }, // end of create abundanceChart

  createInvestigatorChart = function(el, filterEvent, height, width, margins){
    if (height === undefined){
      var height = $(el).height();
    }
    if(width === undefined){
      var width = $(el).width();
    }
    if(margins === undefined){
      var margins = {bottom: 30, top: 10, left: 30, right: 25}
    }

    globals.elements.PIChart = dc.pieChart("#PIChart")
        .width($("#PIChart").width())
        .height($("#PIChart").height())
        .innerRadius(25)
        .renderLabel(false)
        .on('filtered', function(chart, filter){
            globals.state.filters.PI = filter
        })

    if (filterEvent != undefined){
      this.abundanceChart.on('filtered', filterEvent)
    }

    return this.abundanceChart
  }, // end of create abundanceChart




    globals.elements.PIChart = dc.pieChart("#PIChart")
        .width($("#PIChart").width())
        .height($("#PIChart").height())
        .innerRadius(25)
        .renderLabel(false)
        .on('filtered', function(chart, filter){
            globals.state.filters.PI = filter
        })


    globals.elements.recordTypeChart = dc.pieChart("#recordTypeChart")
        .width($("#recordTypeChart").width())
        .height($("#recordTypeChart").height())
        .innerRadius(25)
        .slicesCap(17)
        .renderTitle(true)
        .renderLabel(false)
        .on('filtered', function(chart, filter){
            globals.state.filters.recordType = filter
        })

    //radius scale for bubble chart
    rScale = d3.scale.linear()
      .domain([0, 150])
      .range([0, 25])


    globals.elements.bubbleChart = dc.bubbleChart("#alt-lat-Chart")
      .width($("#alt-lat-Chart").width())
      .height($("#alt-lat-Chart").height())
      .margins({top: 20, right: 10, bottom: 30, left: 40})
      .colors('rgba(167, 167, 167, 0.25)')
      // .brushOn(true)
      .keyAccessor(function (p) {
          return p.value.latitude_average;
      })
      .valueAccessor(function (p) {
          return p.value.altitude_average;
      })
      .radiusValueAccessor(function (p) {
        v = rScale(p.value.value_average)
          return v;
      })
      // .colorAccessor(function (p) {
      //     return p.value.age_average;
      // })
      .elasticY(true)
      .yAxisPadding(10)
      .xAxisPadding(10)
      .label(function (p) {
          return p.key;
          })
      .renderTitle(true)
      .renderLabel(false)
      .xAxisLabel("Latitude")
      .yAxisLabel("Altitude")
      .on('filtered', function(chart, filter){
          globals.state.filters.singleSite = filter
      })

      globals.elements.taxaTable = dc.dataTable("#data-table")
      .height(100)
      .width(200)

  }
}
