//controls the creation and manipulation of NicheViewer
function makeNicheViewer(){
  //dimensions so we know if they change later
  globals.nvWidth = $(globals.nvPanel._container).width()
  globals.nvHeight = $(globals.nvPanel._container).height()
  $("#nv-chart").empty()
  //makes the canvas for drawing the chart
  if (globals.openNVPanel){
    globals.nvPanel.open()
  }else{
    globals.nvPanel.close()
  }

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
  console.log("Updating controls")
  $(".variable-dropdown").empty()
  $(".source-dropdown").empty()
  $(".modifier-dropdown").empty()
  variables = []
  modifiers = []
  sources = []
  data = globals.NVData
  j = 0
  for (layer in data){
    if (data[layer].data.length > 0){
      break
    }else{
      j += 1
    }
  }
  data = globals.NVData[j].data
  for (var i=0; i<data.length; i++){
    layer = data[i]
    variables.push(layer['VariableDescription'])
    modifiers.push(+layer['variablePeriod'])
    sources.push(layer['Model'])
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
    //iterate through the spatial-temporal dimensions
    //each object will be one lat/lng/time and one or more variables
    site = globals.NVData[i]
    siteData = site.data
    latitude = site['latitude']
    longitude = site['longitude']
    yearsBP = site['yearsBP']
    siteName = site['siteName']
    siteID = site['siteID']
    obj = {
      siteName: siteName,
      siteID: siteID,
      latitude: latitude,
      longitude: longitude,
      yearsBP: yearsBP,
      x: undefined,
      y: undefined,
      Xunits: undefined,
      Yunits: undefined
    }
    if ((yearsBP >= globals.minYear) && (yearsBP <= globals.maxYear)){
      for (item in site.data){
        variableData = site.data[item]
        varDesc = variableData['VariableDescription']
        if (varDesc == globals.currentNVXVar){
          obj.x = variableData.value
          obj.Xunits = variableData.variableUnits
        }
        if (varDesc == globals.currentNVYVar){
          obj.y = variableData.value
          obj.Yunits = variableData.variableUnits
        }
      }
      if ((obj.x != undefined) && (obj.y != undefined)){
        toPlot.push(obj)
      }
    }

  } // end of array loop
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
    html = "<h5>Site Name:</strong> <span style='color:red'>" + d.siteName + " ( " + numberWithCommas(d.yearsBP) + " B.P.)</span><br />"
    html += "<strong>" + globals.currentNVXVar + "</strong> <span class = 'text-muted'>" + numberWithCommas(round2(d.x)) + " " + d.Xunits + "</span><br />";
    html += "<strong>" + globals.currentNVYVar + "</strong> <span class = 'text-muted'>" + numberWithCommas(round2(d.y)) + " " + d.Yunits + "</span>";
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
        if (d.yearsBP < 100){
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
