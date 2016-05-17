globals = {}
$(document).ready(function(){
  console.log("Platform loaded.");
  //nav event listeners
  $("#temporal-center-select").change(function(){
    currentCenter = $(this).val();
    $("#windowCenterText").text(currentCenter);

    windowWidth = $("#temporal-window-select").val();
    windowHalf = windowWidth / 2;

    $("#temporalWindowSize").text(windowWidth);

    maxYear = currentCenter - windowHalf;
    minYear = currentCenter - windowHalf;
    $("#maxYearText").text(maxYear);
    $("#minYearText").text(minYear);

    globals.maxYear = maxYear;
    globals.minYear = minYear;
    globals.temporalWidth = windowWidth;
    globals.temporalCenter = currentCenter;

  }) //end temporal center

  $("#temporal-window-select").change(function(){
    currentWidth = $("#temporal-window-select").val();
    windowHalf = currentWidth / 2
    $("#temporalWindowSize").text(currentWidth);
    currentCenter  = $("#temporal-center-select").val();

    maxYear = currentCenter - windowHalf;
    minYear = currentCenter - windowHalf;
    $("#maxYearText").text(maxYear);
    $("#minYearText").text(minYear);

    globals.maxYear = maxYear;
    globals.minYear = minYear;
    globals.temporalWidth = currentWidth;
    globals.temporalCenter = currentCenter;

  }) //end temporal width

  $("#spatial-window-select").change(function(){
    currentVal = $(this).val();
    $("#spatialWindowSize").text(currentVal);
    globals.spatialWindowSize = currentVal;
  })

  //timeline
  function createTimeline(){
    d3.select("#timeline").empty();
    var margins = {top: 0, left: 25, right: 25, bottom: 25}
    var height = 50 - margins.top - margins.bottom;
    var width = $(window).width() - margins.left - margins.right;

    var minYear = 0;
    var maxYear = 22000;


    globals.timeScale = d3.scale.linear()
      .domain([minYear, maxYear])
      .range([0, width]);

      var initialMaxYear = Math.round(globals.timeScale.invert(250));
      $("#minYearText").text(0)
      $("#temporalWindowSize").text(initialMaxYear);
      $("#maxYearText").text(initialMaxYear);

      globals.maxYear = initialMaxYear;
      globals.minYear = 0;


    var svg = d3.select("#timeline")
      .append("svg")
        .attr('width', width + margins.right + margins.left)
        .attr('height', height + margins.top + margins.bottom)
        .append("g")
          .attr("transform", "translate(" + margins.left + ",-6)");


    var xAxis = d3.svg.axis()
      .scale(globals.timeScale)
      .orient("bottom");


      svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .call(xAxis)
         .append("text")
           .attr("class", "label")
           .attr("x", $(window).width() / 2)
           .attr("y", -20)
           .style("text-anchor", "middle")
           .style("font-size", '16px')
           .text("Years Before Present");

    //slider
    globals.timeRect = svg.append('rect')
      .attr('x', 0)
      .attr('y', height)
      .attr('height', 5)
      .attr('width', 100)
      .attr('fill', 'red')
      .attr('stroke', 'none')
      .attr('class', 'draggable')

    globals.leftLine = svg.append('line')
      .attr('x1', 0)
      .attr('y1', height + 10)
      .attr('x2', 0)
      .attr('y2', height-5)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('class', 'draggable')

    globals.rightLine = svg.append('line')
      .attr('x1', 100)
      .attr('y1', height + 10)
      .attr('x2', 100)
      .attr('y2', height - 5)
      .attr('stroke-width', 2)
      .attr('stroke', 'black')
      .attr('class', 'draggable')


      //drag functions
     function onRectDrag(){
        var initX = +globals.timeRect.attr('x')
        var initWidth = +globals.timeRect.attr('width')
        var dx = +d3.event.dx;
        var newX = initX + dx
        var newXEnd = initWidth + newX;

        if (newXEnd > width){
          return
        }
        if (newX < 0){
          return
        }
        globals.timeRect.attr('x', newX)
        globals.leftLine.attr('x1', newX)
        globals.leftLine.attr('x2', newX)
        globals.rightLine.attr('x1', newXEnd)
        globals.rightLine.attr('x2', newXEnd)

        var minYear = Math.round(+globals.timeScale.invert(newX))
        var maxYear = Math.round(+globals.timeScale.invert(newXEnd))
        var windowWidth = maxYear - minYear


        globals.maxYear = maxYear;
        globals.minYear = minYear;
        globals.temporalWidth = windowWidth;

        $("#minYearText").text(globals.minYear)
        $("#maxYearText").text(globals.maxYear)
        $("#temporalWindowSize").text(windowWidth);

        if (globals.heatmap){
          updateHeatmap();
        }

        if (globals.grid){
        //  updateGrid();
        }
      }

      function onLeftDrag(){
        var initX = +globals.leftLine.attr('x1')
        var initWidth = +globals.timeRect.attr('width')
        var dx = +d3.event.dx;
        var newX = initX + dx;
        var newWidth = initWidth - dx;
        var newXEnd = newX + newWidth;

        if (newWidth < 5){
          return;
        }
        if (newWidth > 100){
          return
        }
        if (newX < 0){
          return
        }
        if (newX > width){
          return
        }

        globals.leftLine.attr('x1', newX)
        globals.leftLine.attr('x2', newX)
        globals.timeRect.attr('x', newX)
        globals.timeRect.attr('width', newWidth)

        var minYear = Math.round(+globals.timeScale.invert(initX))
        var maxYear = Math.round(+globals.timeScale.invert(newXEnd))
        var windowWidth = maxYear - minYear
        $("#minYearText").text(minYear)
        $("#maxYearText").text(maxYear)
        $("#temporalWindowSize").text(windowWidth);

        globals.maxYear = maxYear;
        globals.minYear = minYear;
        globals.temporalWidth = windowWidth;

        if (globals.heatmap){
          updateHeatmap();
        }
        if (globals.grid){
        //  updateGrid();
        }

      }

      function onRightDrag(){
        var initRectX = +globals.timeRect.attr('x')
        var initWidth = + globals.timeRect.attr('width')
        var dx = +d3.event.dx;
        var newWidth = initWidth + dx;
        var initLineX = +globals.rightLine.attr('x1')
        var newLineX = +initLineX + dx;
        if (newLineX > width){
          return
        }
        if (newWidth < 5){
          return;
        }
        if (newWidth > 100){
          return
        }
        globals.rightLine.attr('x1', newLineX);
        globals.rightLine.attr('x2', newLineX);
        globals.timeRect.attr('width', newWidth);

        //set the text elements
        var minYear = Math.round(+globals.timeScale.invert(initRectX))
        var maxYear = Math.round(+globals.timeScale.invert(newLineX))
        var windowWidth = maxYear - minYear
        $("#minYearText").text(minYear)
        $("#maxYearText").text(maxYear)
        $("#temporalWindowSize").text(windowWidth);
        globals.maxYear = maxYear;
        globals.minYear = minYear;
        globals.temporalWidth = windowWidth;

        if (globals.heatmap){
          updateHeatmap();
        }
        if (globals.grid){
          //updateGrid();
        }

      }


  //enable drag on the timeline components
  var dragRect = d3.behavior.drag()
  	    .on("drag", onRectDrag)
        .on('dragend', function(){
          if (globals.grid){
            updateGrid()
          }
        })

    var dragLeftLine = d3.behavior.drag()
    	    .on("drag", onLeftDrag)
          .on('dragend', function(){
            if (globals.grid){
              updateGrid()
            }
          });

    var dragRightLine = d3.behavior.drag()
        .on("drag", onRightDrag)
        .on('dragend', function(){
          if (globals.grid){
            updateGrid()
          }
        });

    globals.leftLine.call(dragLeftLine);
    globals.rightLine.call(dragRightLine);
    globals.timeRect.call(dragRect)

    }//end createTimeline function
  createTimeline();

})
