//controls the creation and manipulation of NicheViewer
function makeNicheViewer(){
  //dimensions so we know if they change later
  globals.nvWidth = $(globals.nvPanel._container).width()
  globals.nvHeight = $(globals.nvPanel._container).height()
  $("#nv-chart").empty()
  //makes the canvas for drawing the chart
  globals.nvPanel.open()
  //adds the axes
  console.log("About to make NicheViewer")
  globals.nicheViewer = {}
  globals.nicheViewer.margins = {
    top: 25,
    left: 55,
    right: 25,
    bottom: 40
  }
  globals.nicheViewer.dimensions = {
    height: ($(globals.nvPanel._container).height() - $("#nv-controls").height()) * 0.8 - globals.nicheViewer.margins.top - globals.nicheViewer.margins.bottom, //go with width to make square
    width: $(globals.nvPanel._container).width() * 0.9  - globals.nicheViewer.margins.left - globals.nicheViewer.margins.right,
  }
  globals.nicheViewer.svg = d3.select("#nv-chart").append("svg")
    .attr('height', globals.nicheViewer.dimensions.height + globals.nicheViewer.margins.top + globals.nicheViewer.margins.bottom)
    .attr('width', globals.nicheViewer.dimensions.width + globals.nicheViewer.margins.left + globals.nicheViewer.margins.right)
    .append('g')
      .attr('transform', 'translate(' + globals.nicheViewer.margins.left + "," + globals.nicheViewer.margins.top + ")")

  globals.nicheViewer.xScale = d3.scale.linear()
        .domain([0, 100])
        .range([0, globals.nicheViewer.dimensions.width])

   globals.nicheViewer.yScale = d3.scale.linear()
        .domain([0, 100])
        .range([globals.nicheViewer.dimensions.height, 0])

    globals.nicheViewer.xAxis = d3.svg.axis()
      .orient('bottom')
      .scale(globals.nicheViewer.xScale)

    globals.nicheViewer.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + globals.nicheViewer.dimensions.height + ")")
      .call(globals.nicheViewer.xAxis);

    globals.nicheViewer.yAxis = d3.svg.axis()
        .orient('left')
        .scale(globals.nicheViewer.yScale)

    globals.nicheViewer.svg.append("g")
      .attr("class", "y axis")
      .call(globals.nicheViewer.yAxis);


      globals.nicheViewer.svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr('class', 'y-axis-label')
          .attr("y", 0 - globals.nicheViewer.margins.left)
          .attr("x",0 - (globals.nicheViewer.dimensions.height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("");

        globals.nicheViewer.svg.append("text")      // text label for the x axis
            .attr("transform", "translate(" + (globals.nicheViewer.dimensions.width / 2) + " ," + (globals.nicheViewer.dimensions.height + globals.nicheViewer.margins.bottom) + ")")
            .style("text-anchor", "middle")
            .attr('class', 'x-axis-label')
            .text("");

  updateNicheViewerControls()
  updateNicheViewer()
  //event listeners
  $(".source-dropdown").change(setNVParams)
  $(".variable-dropdown").change(setNVParams)
  $(".modifier-dropdown").change(setNVParams)
}

function updateNicheViewerControls(){
  //put variables into dropdowns
  //clear current
  $(".variable-dropdown").empty()
  $(".source-dropdown").empty()
  $(".modifier-dropdown").empty()
  variables = []
  modifiers = []
  sources = []
  modern = globals.NVData[0].slices['Modern']
  for (var i=0; i<modern.length; i++){
    layer = modern[i]
    variables.push(layer['variableName'])
    modifiers.push(+layer['layerModifier'])
    sources.push(layer['layerSource'])
  }//end loop
  uniqueVars = _.uniq(variables).sort()
  uniqueMods = _.uniq(modifiers).sort(compareNumbers) //compare numerically
  uniqueSources = _.uniq(sources).sort()

  for (var i =0; i<uniqueVars.length; i++){
    $(".variable-dropdown").append("<option>" + uniqueVars[i] + "</option>")
  }
  for(var i=0; i<uniqueMods.length; i++){
    $(".modifier-dropdown").append("<option>" + uniqueMods[i] + "</option>")
  }
  for (var i= 0; i< uniqueSources.length; i++){
    $(".source-dropdown").append("<option>" + uniqueSources[i] + "</option>")
  }
}

function updateNicheViewer(){
  //chooses the right values from the dataset and plots them

  xVar = globals.currentNVXVar
  yVar = globals.currentNVYVar
  xMod = globals.currentNVXMod
  yMod = globals.currentNVYMod
  xSource = globals.currentNVXSource
  ySource = globals.currentNVYSource
  toPlot = []
  for (var i=0; i< globals.NVData.length; i++){
    //iterate through the spatial dimension
    site = globals.NVData[i];
    sliceList = _.keys(site.slices)
    for (var j = 0; j< sliceList.length; j++){
      //iterate through the temporal dimension

      key = sliceList[j]
      if (key != "Modern"){
        key = parseInt(key)
      }
      if (((key >= globals.minYear) && (key <= globals.maxYear))|| (key == 'Modern')){
        plotObj = {
          x: undefined,
          y: undefined,
          t: key,
          siteName: site['siteName'],
          siteID: site['siteID'],
          units: undefined
        }
        slice = site.slices[key.toString()]
        for (var p=0; p<slice.length; p++){
          layer = slice[p]
          varName = layer['variableName']
          varMod = layer['layerModifier']
          units = layer['units']
          varSource = layer['layerSource']
          val = layer.value
          if ((varSource == xSource) && (varName == xVar) ){
            plotObj.x = val
          }
          if ((varSource == ySource) && (varName == yVar) ){
            plotObj.y = val
          }
        } // end slice variables loop
        if ((plotObj.x != undefined) && (plotObj.y != undefined)){
          plotObj['units'] = units
          toPlot.push(plotObj)
        }
      } // end if key in range statement
    } // end slices loop
  } // sites loop
  //all of the data should now be in the array of plotting objects
  //update the axes
  xExtent = d3.extent(toPlot, function(d) { return +d.x})

  if (xExtent[0] > 0){
    xExtent[0] = 0
  }
  yExtent = d3.extent(toPlot, function(d){return +d.y})
  if (yExtent[0] > 0){
    yExtent[0] = 0
  }
  globals.nicheViewer.xScale.domain(xExtent).nice()
  globals.nicheViewer.yScale.domain(yExtent).nice()

  //tooltips
  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    html = "<h5>Site Name:</strong> <span style='color:red'>" + d.siteName + "</span><br />"
    html += "<strong>" + globals.currentNVXVar + "</strong> <span class = 'text-muted'>" + numberWithCommas(round2(d.x)) + " " + d.units + "</span><br />";
    html += "<strong>" + globals.currentNVYVar + "</strong> <span class = 'text-muted'>" + numberWithCommas(round2(d.y)) + " " + d.units + "</span>";
    return html
  })
  globals.nicheViewer.svg.call(tip)


  //plot the points
  globals.nicheViewer.svg.selectAll('.nv-point').remove().transition()

  globals.nicheViewer.svg.selectAll(".nv-point")
    .data(toPlot)
    .enter()
      .append('circle')
      .attr('class', 'nv-point')
      .attr('r', 2.5)
      .attr('fill', function(d){
        if (d.t == 'Modern'){
          return 'red'
        }else{
          return 'blue'
        }
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0.25)

    globals.nicheViewer.svg.selectAll(".nv-point").transition().duration(1000)
    .attr('cx', function(d){
      return globals.nicheViewer.xScale(d.x)
    })
    .attr('cy', function(d){
      return globals.nicheViewer.yScale(d.y)
    })

    globals.nicheViewer.svg.selectAll(".nv-point").on('mouseover', function(d){
        d3.select(this).attr('stroke', 'red').attr('stroke-width', 1)
        tip.show(d)
      })
      .on('mouseout', function(d){
        d3.select(this).attr('stroke', 'black').attr('stroke-width', 0.25)
        tip.hide(d)
      })




  globals.nicheViewer.svg.selectAll(".x.axis") // change the x axis
    .call(globals.nicheViewer.xAxis);
  globals.nicheViewer.svg.selectAll(".y.axis") // change the y axis
    .call(globals.nicheViewer.yAxis);

    d3.selectAll(".x-axis-label").transition().text(globals.currentNVXVar)
    d3.selectAll(".y-axis-label").transition().text(globals.currentNVYVar)



} //end function

setNVParams = function(){
  //xAxis
  var xSource = $("#x-source-dropdown option:selected").text()
  var xVar = $("#x-variable-dropdown option:selected").text()
  var xMod = $("#x-modifier-dropdown option:selected").text()

  //yAxis
  var ySource = $("#y-source-dropdown option:selected").text()
  var yVar = $("#y-variable-dropdown option:selected").text()
  var yMod = $("#y-modifier-dropdown option:selected").text()

  globals.currentNVXVar = xVar
  globals.currentNVYVar = yVar
  globals.currentNVXMod = xMod
  globals.currentNVYMod = yMod
  globals.currentNVXSource = xSource
  globals.currentNVYSource = ySource

  updateNicheViewer()
}

function compareNumbers(a, b)
{
    return a - b;
}
