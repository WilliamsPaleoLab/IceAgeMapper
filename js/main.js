//This is main.js for IceAgeMapper
//Author: Scott Farley
//UW-Madison
//MIT License


globals = {}
globals.map = {}


// globals.currentNVXVar = "JanuaryMinimum Temperature  [C]  (Decadal Average)"
// globals.currentNVYVar = "July Maximum Temperature  [C] (Decadal Average)"
// globals.currentNVXMod = 0
// globals.currentNVYMod = 0
// globals.currentNVXSource = "Community Climate System Model (CCSM)"
// globals.currentNVYSource = "Community Climate System Model (CCSM)"


//load the idw module
// var idw = require("idw")

globals.heatOptions = {
  opacity: 0.3,
  maxZoom: 8,
  cellSize: 100,
  exp: 2,
}

siteMarkerOptions = {
  radius: 2.5,
  fill: true,
  fillColor: 'seetlblue',
  strokeColor: 'steelblue'
}

psOptions = {
  fill: true,
  fillColor: 'red',
  strokeColor:'red'
}

//initial page stuff
$("#loading").hide()


//jquery element functions
$("#searchBar").keypress(function(e){
  //fire new ajax when enter is clicked
    if (e.which == 13){
        $("#searchButton").trigger('click');
    }
});

$(".nav-item").hover(function(){
  $(this).toggleClass("nav-hover")
}, function(){
  $(this).toggleClass("nav-hover")
})

$(document).ready(function(){
  processQueryString() //parse the URI query
  load();
})

function load(){
  createMap(); // load the leaflet map
  loadTaxaFromNeotoma(createSearchWidget) // load the taxa endpoint from neotoma and create an autocomplete search out of it
  createHeatmapLayer() // create a blank layer that we can load into later
  createTimeline();
  loadIceSheets()
}

function createMap(){
  globals.map.map = L.map('map',
  {zoomControl:false,
    fullscreenControl: true
  }).setView([39.828175, -98.5795], 3);

  L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
  	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
  	maxZoom: 8,
    minZoom: 3
  }).addTo(globals.map.map);
  //set to default or URL requested
  globals.map.map.setView([globals.centerLat, globals.centerLng], globals.zoom)
  createLayerController() //creates an empty layer controller
  createToolbar()
  createSitePanel()
  createTaxonomyPanel()
  createNicheViewerPanel()

  //panel events
  $(".leaflet-control-dialog").on('mousedown', function(){
     movePanelToFront(this)
  })
  globals.map.map.on("dialog:resizeend", onAllPanelResized)
}

function createSitePanel(){
  globals.sitePanel = L.control.dialog({anchor: [180, 25], initOpen: false})
              .setContent("<h6>Click on a site to retrieve details about it.")
              .addTo(globals.map.map)
  globals.sitePanel.name = "SitePanel"
  $(globals.sitePanel._container).find(".leaflet-control-dialog-grabber").append("</i id='site-panel-title'>Site Information</i>")
}

function createTaxonomyPanel(){
  globals.taxonomyPanel = L.control.dialog({ anchor: [150, -5], initOpen: false})
    .setContent("<h6>Search for a taxon to retrieve its taxonomic hierarchy.</h6>")
    .addTo(globals.map.map)
    globals.taxonomyPanel.name = "TaxonomyPanel"
    $(globals.taxonomyPanel._container).find(".leaflet-control-dialog-grabber").append("<i id='taxonomy-panel-title'>Taxonomy</i>")
}

function createNicheViewerPanel(){
  globals.nvPanel = L.control.dialog({ anchor: [400, -5], minSize: [350, 350], maxSize: [1000000, 1000000], size: [500,500], initOpen: false})
    .addTo(globals.map.map)
    globals.taxonomyPanel.name = "NV"
    makeBaseNicheViewerPanel()
    //globals.nvPanel.close()
    $(globals.nvPanel._container).find(".leaflet-control-dialog-grabber").append("<i id='nv-panel-title'>NicheViewer</i>")
}

function createToolbar(){
  var NicheViewerToolAction = L.ToolbarAction.extend({
      options: {
          toolbarIcon: {
              html: "<img id='stats-icon'  data-toggle='tooltip' data-title='Open NicheViewer Panel' data-placement='bottom' src='images/icons/stats.svg'/>",
              class:'toolbar-item'
          }
      },
      addHooks: function () {
        globals.openNVPanel = true
          globals.nvPanel.open()
          movePanelToFront(globals.nvPanel._container)
      }
  });
  var TaxonomyToolAction = L.ToolbarAction.extend({
      options: {
          toolbarIcon: {
              html: "<img id='tree-icon' data-toggle='tooltip' data-title='Open Taxonomy Panel' src='images/icons/hierarchy.svg'/>",
              class:'toolbar-item'
          }
      },
      addHooks: function () {
        globals.openTaxPanel = true
          globals.taxonomyPanel.open()
          movePanelToFront(globals.taxonomyPanel._container)
      }
  });
  var SiteToolAction = L.ToolbarAction.extend({
      options: {
          toolbarIcon: {
              html: "<img id='site-icon' data-toggle='tooltip' data-title='Open Site Details Panel' src='images/icons/here.svg'/>",
              class:'toolbar-item'
          }
      },
      addHooks: function () {
          //globals.map.map.setView([48.85815, 2.29420], 19);
            globals.openSitePanel = true;
            globals.sitePanel.open();
            movePanelToFront(globals.sitePanel._container)
      }
  });

  var ShareAction = L.ToolbarAction.extend({
    options: {
      toolbarIcon: {
        html: "<img id='share-icon'  data-toggle='tooltip' data-title='Share your map' src='images/icons/share.svg'/>",
        class: 'toolbar-item'
      }
    },
      addHooks: function(){
        //generate the share url string
        globals.shareURI = generateShareURI()

        uriString = globals.shareURI.toString()
        generateTwitterLink() //make sure the twitter link is right
        generateEmailLink() //make sure the email link is right
        generateGPlusLink()
        //set it so its visible to the user
        $("#share-link").text(uriString)
        $("#share-modal").modal('show')
        $("#share-link").select()
        window.history.pushState("Ice Age Mapper", "Ice Age Mapper", globals.shareURI) //put page state in url history so we can return if we leave (i.e., go to twitter)
      }
  })

  var advancedAction = L.ToolbarAction.extend({
    options: {
      toolbarIcon: {
        html: "<img id='advanced-icon' data-toggle='tooltip' data-title='Advanced Settings' data-placement='top' src='images/icons/advanced.svg'/>",
        class: 'toolbar-item'
      }
    },
      addHooks: function(){
        $("#advanced-modal").modal('show')
      }
  })

  globals.toolbar = new L.Toolbar.Control({
      actions: [NicheViewerToolAction, SiteToolAction, TaxonomyToolAction, ShareAction, advancedAction], position: 'topright'
  }).addTo(globals.map.map);

  $("#site-icon").hover(function(){
    $(this).attr("src", "images/icons/here-black.svg")
  }, function(){
    $(this).attr("src", "images/icons/here.svg")
  })
  $("#advanced-icon").hover(function(){
    $(this).attr("src", "images/icons/advanced-black.svg")
  }, function(){
    $(this).attr("src", "images/icons/advanced.svg")
  })

  $("#tree-icon").hover(function(){
    $(this).attr("src", "images/icons/hierarchy-black.svg")
  }, function(){
    $(this).attr("src", "images/icons/hierarchy.svg")
  })

  $("#stats-icon").hover(function(){
    $(this).attr("src", "images/icons/stats-black.svg")
  }, function(){
    $(this).attr("src", "images/icons/stats.svg")
  })
  $("#share-icon").hover(function(){
    $(this).attr("src", "images/icons/share-black.svg")
  }, function(){
    $(this).attr("src", "images/icons/share.svg")
  })
}

function createLayerController(){
  //create the layer controls
  globals.map.layerController = L.control.layers(null, globals.map.layers, {position: 'topright'})
    .addTo(globals.map.map)

  //control add/remove events for the different layers by setting a global variable we can access later
  globals.map.map.on('overlayadd', function(e){
    if (e.name == "Icesheets"){
      globals.showIce = true
    }
    if (e.name == "Sites"){
      globals.showSites = true
    }
    if (e.name == "Heatmap"){
      globals.showHeat = true
    }
  })
  globals.map.map.on('overlayremove', function(e){
    if (e.name == "Icesheets"){
      globals.showIce = false
    }
    if (e.name == "Sites"){
      globals.showSites = false
    }
    if (e.name == "Heatmap"){
      globals.showHeat = false
    }
  })
}



function loadTaxaFromNeotoma(callback){
  //load all of the vascular plant taxa from the neotoma database
  $.ajax("http://api.neotomadb.org/v1/data/taxa?taxagroup=VPL", {
    beforeSend: function(){
      $("#loading").show();
    },
    beforeSend: function(jqXHR){
      jqXHR.setRequestHeader('Accept-Encoding', 'gzip');
    },
    dataType: "jsonp",
    cache: true,
    error: function(xhr, status, error){
      console.log(xhr)
      console.log(status)
      console.log(error)
    },
    success: function(data){
      if (data['success']){
        if (callback){
          callback(data['data'])
        }
      }else{
        console.log("Server error on Neotoma's end.")
      }

    }
  })
}

function createSearchWidget(jsonResponse){
  names = _.pluck(jsonResponse, 'TaxonName')
  var input = document.getElementById("searchBar");
  var awesomplete = new Awesomplete(input, {
    minChars: 0,
    maxItems: 5,
    autoFirst: true,
    filter: Awesomplete.FILTER_STARTSWITH
  });
  awesomplete.list = names;
  $("#loading").slideUp()
}

$("#searchButton").click(function(){
  s = $("#searchBar").val()
  if (s != ""){
    loadOccurrenceData(s);
  }
})

function createTimeline(){
  d3.select("#timeline").empty();
  var margins = {top: 25, left: 30, right: 5, bottom: 125}
  var height = $("#timeline").height() - margins.top - margins.bottom;
  var width = $("#timeline").width() - margins.left - margins.right;

  var minYear = -75;
  var maxYear = 22000;


  globals.timelineTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([150, 50])
    .html(function(d){
      minYearFormat = numberWithCommas(Math.round(globals.minYear))
      maxYearFormat = numberWithCommas(Math.round(globals.maxYear))
      return ("Min Year: " + minYearFormat + "B.P.<br />" + "Max Year: " + maxYearFormat + " B.P.")
    })


  globals.timeScale = d3.scale.linear()
    .domain([minYear, maxYear])
    .range([0, height]);

  var svg = d3.select("#timeline")
    .append("svg")
      .attr('width', width + margins.right + margins.left)
      .attr('height', height + margins.top + margins.bottom)
      .append("g")
        .attr("transform", "translate(50," + margins.top + ")")


  var xAxis = d3.svg.axis()
    .scale(globals.timeScale)
    .orient("right");


    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(" + 0 + ",0)")
       .call(xAxis)
       .append("text")
         .attr("class", "label")
         .attr("y", height / 2)
         .attr("x", -10)
         .style("text-anchor", "middle")
         .style("font-size", '16px')
         .text("Years Before Present")
         .attr('transform', 'rotate(-90 -15,' + height / 2 + ')')



    //create the rectangle
    globals.timeRect = svg.append('rect')
      .attr('x', 0)
      .attr('y', globals.timeScale(globals.minYear))
      .attr('height', globals.timeScale(globals.maxYear))
      .attr('width', 5)
      .style('fill', '#3f7e8a')
      .style('stroke', 'black')
      .attr('cursor', 'ns-resize')

    globals.timeTop = svg.append('line')
      .attr('x1', 0)
      .attr('x2', 10)
      .attr('y1', globals.timeScale(globals.minYear))
      .attr('y2', globals.timeScale(globals.minYear))
      .style('stroke', 'black')
      .style('stroke-width', 5)
      .style('stroke-opacity', 0.5)
      .attr('cursor', 'ns-resize')

    globals.timeBottom = svg.append('line')
      .attr('x1', 0)
      .attr('x2', 10)
      .attr('y1', globals.timeScale(globals.maxYear))
      .attr('y2', globals.timeScale(globals.maxYear))
      .style('stroke', 'black')
      .style('stroke-width', 5)
      .style('stroke-opacity', 0.5)
      .attr('cursor', 'ns-resize')


      //svg.call(globals.timelineTip)



      function onRectDrag(){
        initY = +globals.timeRect.attr('y')
        initHeight = +globals.timeRect.attr('height')
        dy = d3.event.dy
        newY = initY + dy
        if (newY < 0){
          return
        }
        if (newY + initHeight > height){
          return
        }
        globals.timeRect.attr('y', newY)
        globals.timeTop.attr('y1', newY).attr('y2', newY)
        globals.timeBottom.attr('y1', newY + initHeight).attr('y2', newY + initHeight)
        globals.minYear = globals.timeScale.invert(+globals.timeTop.attr('y1'))
        globals.maxYear = globals.timeScale.invert(+globals.timeBottom.attr('y1'))
        updateTime()
      }
      function onTopDrag(){
        initY = +globals.timeTop.attr('y1')
        initHeight = +globals.timeRect.attr('height')
        dy = d3.event.dy
        newTop = initY + dy
        if (newTop < 0){
          return
        }
        newHeight = initHeight - dy
        if (newHeight < 10){
          return
        }
        globals.timeRect.attr('height', newHeight).attr('y', newTop)
        globals.timeTop.attr('y1', newTop).attr('y2', newTop)
        globals.minYear = globals.timeScale.invert(+globals.timeTop.attr('y1'))
        globals.maxYear = globals.timeScale.invert(+globals.timeBottom.attr('y1'))
        updateTime()
        //add a tooltip showing what year you're looking at
        // Define the div for the tooltip
        formatMinYear = Math.round(globals.minYear)

      }
      function onBottomDrag(){
        initY = +globals.timeTop.attr('y1')
        initBottom = +globals.timeBottom.attr('y1')
        initHeight = +globals.timeRect.attr('height')
        dy = -d3.event.dy
        newHeight = initHeight - dy
        if (newHeight < 10){
          return
        }
        newBottom = initBottom - dy
        if (newBottom > height){
          return
        }
        globals.timeRect.attr('height', newHeight)
        globals.timeBottom.attr('y1', newBottom).attr('y2', newBottom)
        globals.minYear = globals.timeScale.invert(+globals.timeTop.attr('y1'))
        globals.maxYear = globals.timeScale.invert(+globals.timeBottom.attr('y1'))
        updateTime()
      }


      //enable drag on the timeline components
      var dragRect = d3.behavior.drag()
      	    .on("drag", onRectDrag)

        var dragTopLine = d3.behavior.drag()
        	    .on("drag", onTopDrag)

        var dragBottomLine = d3.behavior.drag()
            .on("drag", onBottomDrag)

        globals.timeTop.call(dragTopLine);
        globals.timeBottom.call(dragBottomLine);
        globals.timeRect.call(dragRect)


      // //enable tooltips
      // globals.timeTop.on('mouseover', function(){
      //     globals.timelineTip.show()
      // })
      // globals.timeTop.on('mouseout', function(){
      //   globals.timelineTip.hide()
      // })
      // globals.timeBottom.on('mouseover', function(){
      //   globals.timelineTip.show()
      // })
      // globals.timeBottom.on('mouseout', function(){
      //   globals.timelineTip.hide()
      // })
      // globals.timeRect.on('mouseover', function(){
      //   globals.timelineTip.show()
      // })
      // globals.timeRect.on('mouseout', function(){
      //   globals.timelineTip.hide()
      // })


    //exact control of years
    html = "<div id='timelineControl'>"
    html += "<input id='minYearSelect' class='input-sm' type='number' value = '" + globals.minYear + "' max='22000' min='-75' data-toggle='tooltip' title='Set the minimum year (Years B.P.)'>"
    html += "<br />"
    html += "<input id='maxYearSelect' class='input-sm' type='number' value = '" + globals.maxYear + "' max='22000' min='-75' data-toggle='tooltip' title='Set the maximum year (Years B.P.)'>"

    html += "</div>"
    $("#timeline").append(html)
    $("#timelineControl").css({
      "position" : "absolute",
      "top" : height + 50 + "px",
      "left" : margins.left + "px"
    })
    //calculate width
    //we could do this with a popover if this is too small
    boxWidth = width - margins.right
    $("#minYearSelect").css({'width': boxWidth + 'px', 'font-size' : '8px'})
    $("#maxYearSelect").css({'width': boxWidth + 'px', 'font-size' :  '8px'})

    //make the text boxes work
    $("#minYearSelect").change(function(){
        minYear = $(this).val()
        setMinYear(minYear)
    })
    //make the text boxes work
    $("#maxYearSelect").change(function(){
      maxYear = $(this).val()
      setMaxYear(maxYear)
    })

    //advance in increments using arrows
    html = "<div id='timelineArrows' class='row'>"
    html += "<span class='btn btn-lrg glyphicon glyphicon-chevron-left' id='advanceForward' data-toggle='tooltip' title='Advance interval forward'></span>"
    html += "<span class='btn btn-lrg glyphicon glyphicon-chevron-right'  id='advanceBackwards' data-toggle='tooltip' title='Advance interval backwards'></span>"
    html += "</div>"
    $("#timeline").append(html)
    $("#timelineArrows").css({
      "position" : "absolute",
      "top" : height + 100 + "px",
      "left" : margins.left + "px",
      'padding' : '5px',

    })

    //make the buttons work
    $("#advanceForward").on('click', function(){
      //figure out what new mins and maxes are
      timeSpan = globals.maxYear - globals.minYear
      newMin = globals.minYear - timeSpan
      if (newMin < -75){
        newMin = -75
      }
      newMax = newMin + timeSpan
      setMinYear(newMin)
      setMaxYear(newMax)
    })

    $("#advanceBackwards").on('click', function(){
      //figure out what new mins and maxes are
      timeSpan = +globals.maxYear - +globals.minYear
      newMin = +globals.minYear + timeSpan
      newMax = newMin + timeSpan
      if (newMax > 22000){
        newMax = 22000
      }
      newMin = +newMax - +timeSpan
      setMaxYear(newMax)
      setMinYear(newMin)
    })


  //end createTimeline function
}

function setMinYear(minYear){
  //sets the global attribute and deals with moving the time rectangle and also the top and bottom drag lines
  minYear = +minYear
  if (minYear > 22000){
    minYear = 22000
  }
  if (minYear < -75){
    minYear = -75
  }
  yearSpan = globals.maxYear - minYear
  if (yearSpan < 50){
    console.log("Setting to min value")
    yearSpan = 50
    minYear = +globals.maxYear - 50
    $("#minYearSelect").val(minYear)
  }
  globals.timeTop.attr('y1', globals.timeScale(minYear))
  globals.timeTop.attr('y2', globals.timeScale(minYear))
  globals.minYear = +minYear
  heightSpan = globals.timeScale(yearSpan)
  globals.timeRect.attr('y', globals.timeScale(globals.minYear)).attr('height', heightSpan)
  //globals.maxYear = globals.timeScale.invert(+globals.timeRect.attr('height'))
  globals.timeBottom.attr('y1', globals.timeScale(minYear) + heightSpan)
  globals.timeBottom.attr('y2', globals.timeScale(minYear) + heightSpan)
  updateTime()
}
function setMaxYear(maxYear){
  ///sets top and bottom lines and rectangle position, then updates the time in the app
  if (maxYear > 22000){
    maxYear = 22000
  }
  if (maxYear < -75){
    maxYear = -75
  }
  yearSpan = maxYear - globals.minYear
  if (yearSpan < 50){
    yearSpan = 50
    maxYear = +globals.minYear + 50
    //reset the text box so it knows we did this adjustment
    $("#maxYearSelect").val(maxYear)
  }
  globals.timeBottom.attr('y1', globals.timeScale(maxYear))
  globals.timeBottom.attr('y2', globals.timeScale(maxYear))
  globals.maxYear = +maxYear
  heightSpan = globals.timeScale(yearSpan)
  globals.timeRect.attr('height', heightSpan)
  updateTime()
}

function loadOccurrenceData(taxon){
  globals.taxon =taxon
  $("#loading").show()
  loc = "-167.276413,5.49955,-52.23304,83.162102"
  url = "http://apidev.neotomadb.org/v1/data/pollen?taxonname="
  url += taxon
  url += "&bbox=" + loc
  if (globals.aggType == "base"){
    console.log("Aggregating is in alpha development.")
    url += "&nametype=base"
  }
  url += "&ageold=22000&ageyoung=-100"
  $.ajax(url, {
     beforeSend: function(jqXHR){
       $("#loading").slideDown()
       // set request headers here rather than in the ajax 'headers' object
      jqXHR.setRequestHeader('Accept-Encoding', 'gzip');
     },
     error: function(xhr, status, error){
       console.log(xhr)
       console.log(status)
       console.log(error)
       $("#loading").text("Server error.")
     },
    cache: true,
     dataType: "jsonp",
     success: function(data){
       if (data['success']){
        globals.data = data['data']
        if (data['data'].length == 0){
          alert("No results were returned.")
          $("#loading").slideUp()
          return
        }
        globals.taxonid = data['data'][0]['TaxonID']
        $("#loading").slideUp()
         //determine what to do with the data
         //createHeatmapLayer();
         updateHeatmap()
         updateSites()
         getTaxonomy()
         setTimelinePoints(data['data'])
         if (!globals.openSitePanel){
           globals.sitePanel.close()
         }
         populateTotalFieldDialog()
         //globals.geojsonData = GeoJSON.parse(globals.data, {Point: ['LatitudeNorth', 'LongitudeWest']})
         //globals.nvPanel.close()
         //NicheViewer stuff
         //make fake nv data (for now)
        //globals.NVResponse = makeFakeData(100, 12, 12, 3)
        //  if (globals.NVResponse.success){
        //    globals.NVData = globals.NVResponse.data
        //    makeNicheViewer()
        //  }else{
        //    console.log("Failed to load environmental layers for NicheViewer.")
        //  }
        // getNicheData(globals.data, true)
       }else{
         console.log("Server error on Neotoma's end.")
         $("#loading").text("Server error.")
       }
     }
  })
}


counter = 0
function getNicheData(dataset, getModern){
  //gets niche data from the server to make the niche diagram
  //if getModern is true, will get both the modern (BP 0) and past values for each site in the argument dataset
  request = {
    locations: []
  }
  $("#loading").slideDown()
  $("#loadprogress").attr('value', 0)
  $("#loadprogress").attr('max', dataset.length)
  totalCounter = dataset.length

  //form the post data payload
  for (item in dataset){
    site = dataset[item]
    siteID = site['SiteID']
    siteName = site['SiteName']
    longitude = (site['LongitudeEast'] + site['LongitudeWest']) / 2
    latitude = (site['LatitudeNorth'] + site['LatitudeSouth']) / 2
    yearsBP = site['Age']
    if ((yearsBP == null) || (yearsBP == undefined)){
      yearsBP = (site['AgeOlder'] + site['AgeYounger']) / 2
    }
    obj = {siteID:siteID, siteName:siteName, latitude:latitude, longitude:longitude, yearsBP:yearsBP}
    request.locations.push(obj)
    // $.ajax("http://localhost:8080/data", {
    //   data: obj,
    //   contentType: "json",
    //   method: 'GET',
    //   success: function(response){
    //     counter += 1;
    //     console.log(counter)
    //     $("#loadprogress").attr('value', counter)
    //   },
    //   error: function(){
    //     console.log(error)
    //   },
    //   beforeSend: function(){
    //     $("#loading").show()
    //   }
    // })
  }
  //wmake the ajax request
  $.ajax("http://130.211.157.239:8080/data", {
    data: JSON.stringify(request),
    method: "POST",
    contentType: "application/json",
    error: function(xhr, status, error){
      console.log(xhr)
      console.log(status)
      console.log(error)
    },
    beforeSend: function(){
      $("#loading").slideDown()
      $("#loading").text("Getting niche data...")
    },
    success: function(response){
      globals.NVData = response.data
      //makeNicheViewer()
      //updateNicheViewerControls()
      $("#loading").slideUp()
      $("#loading").text("Loading...")
    }
  })
}

function createHeatmapLayer(){
  //create a blank heatmap layer
  //remove from layer control if its already defined
  //create the heatmap layer
  var heat = L.webGLHeatmap({size:75, units:'px',  opacity: 0.5, alphaRange:0.0001});
  // heat.addTo(globals.map.map);
  globals.map.map.addLayer(heat)
  globals.map.layers['Heatmap'] = heat;
  globals.heat = heat;
}

function updateHeatmap(){
  //update the data array
  newData = {}
  for (var i=0; i< globals.data.length; i++){
    d = globals.data[i]
    if ((+d.Age == null) || (+d.Age == "")){
      d.Age = (+d.AgeOlder + d.AgeYounger)/2
    }
    if (((+d.Age > globals.minYear) && (+d.Age <= globals.maxYear))){
      add = true
    }else{
      add = false
    }
    siteID = d.SiteID
    if (add){
      if (newData[siteID] == undefined){
        newData[siteID] = {
          sum : 0,
          data : d
        }
      }
      newData[siteID].sum += (d['Value'] / d[globals.TotalField])
    }
  }
  dataset = new Array()
  for (i in newData){
    d = newData[i]
    pct = d.sum
    lat = (d.data.LatitudeNorth + d.data.LatitudeSouth)/2
    lng = (d.data.LongitudeWest + d.data.LongitudeEast) / 2
    dataset.push([lat, lng, pct])
  }
  if (globals.heatmapSymbology == 'relative'){
    //linear transform the pct field so that 1 is the max
    pctMax = d3.max(dataset, function(d){return(d[2])})
    transformScale = d3.scale.linear()
      .domain([0, pctMax])
      .range([0, 1])
    for (var i=0; i<dataset.length; i++){
      d = dataset[i][2]
      x = transformScale(d)
      dataset[i][2] = x
    }
  }
  // dataset = _.filter(globals.data, function(d){
  //   if ((+d.Age == null) || (+d.Age == "")){
  //     d.Age = (+d.AgeOlder + d.AgeYounger)/2
  //   }
  //   return ((+d.Age > globals.minYear) && (+d.Age <= globals.maxYear));
  // })
  // dataset = _.map(dataset, function(d){
  //   if (d[globals.TotalField] != null){
  //     pollenPercentage =
  //   }else{
  //     pollenPercentage = 0
  //   }
  //   return [(+d.LatitudeNorth + +d.LatitudeSouth)/2, (+d.LongitudeEast + +d.LongitudeWest)/2, pollenPercentage];
  // })

  if (globals.heat != undefined){
    globals.map.layerController.removeLayer(globals.heat)
  }

  globals.heatmapData = dataset;
  globals.heat.setData(dataset);
  // globals.heat.redraw();
  globals.map.layerController.addOverlay(globals.heat, "Heatmap") //add layer to controller
  updateControlID()
  if(!globals.showHeat){
    $("#Heatmap_control").trigger('click')
  }
  // globals.iceSheets.bringToFront();
  // bringMarkersToFront()
  //L.heat.bringToBack();
}//end update heat function

function updatePropSymbols(){
  removePropSymbols()
  propSymbols = []
  for (var i=0; i< globals.data.length; i++){
    s = globals.data[i]
    age = s.Age
    if (age == null){
      age = (s.AgeYounger + s.AgeOlder)/2
    }
    if ((age >= globals.minYear) && (age <= globals.maxYear)){
      siteID = s.SiteID
      name = s.SiteName
      if (s[globals.TotalField] != null){
        pct = s.Value / s[globals.TotalField] * 100
      }else{
        pct = 0
      }
      lat = (s.LatitudeSouth + s.LatitudeNorth) / 2
      lng = (s.LongitudeEast + s.LongitudeWest) / 2
      opts = psOptions
      opts.radius = makeRadius(pct)
      l = L.circleMarker([lat, lng, siteID], opts)
        .bindPopup("<h6>" + name + "</h6><p>Relative Abundance: " + pct + "%</p><p>Age: " + age + " Years B.P.</p>")
      propSymbols.push(l)
      l.ps = true
    }
    psLayerGroup = L.layerGroup(propSymbols).addTo(globals.map.map)
  }


}
function updateSites(){
  //add circleMarkers to the map where the sites are

  removeSites()
  siteIds = []
  sites = []
  globals.siteAges = {}
  for(var i =0; i< globals.data.length; i++){
    s = globals.data[i]
    lat = (s.LatitudeSouth + s.LatitudeNorth) / 2
    lng = (s.LongitudeEast + s.LongitudeWest) / 2
    name = s.SiteName
    id = s.SiteID
    age = s.Age
    if (age == null){
      age = (s.AgeYounger + s.AgeOlder)/2
    }
    if ((age >= globals.minYear) && (age <= globals.maxYear)){
      if (siteIds.indexOf(id) == -1){
        sites.push({siteName: name, siteID: id, lat: lat, lng:lng})
        siteIds.push(id)
      }
    }
    if (globals.siteAges[id] == undefined){
      globals.siteAges[id] = []
    }
    globals.siteAges[id].push(age)
  } // end loop
  siteLayer = []
  for (var i=0; i< sites.length; i++){
    l = L.circleMarker([sites[i].lat, sites[i].lng, sites[i].siteID], siteMarkerOptions)
    .bindPopup("<h6>" + sites[i].siteName + "</h6>")
    l.site = true;
    l.siteID = sites[i].siteID
    siteLayer.push(l)
    l.on('click', function(){
      var siteid = this._latlng.alt
      getSiteDetails(siteid);
      globals.map.map.setView(this._latlng)
      movePanelToFront(globals.sitePanel._container)
    })
    globals.siteMarkers.push(l)
  }
  //see if visible
  //hackiest thing ever
    //but its fine
  globals.sitesVisible = globals.showSites
  globals.map.layerController.removeLayer(globals.siteLayer)
  globals.siteLayer = L.layerGroup(siteLayer).addTo(globals.map.map)
  if (!globals.sitesVisible){
    globals.map.map.removeLayer(globals.siteLayer);
  }
  globals.map.layerController.addOverlay(globals.siteLayer, "Sites")
  updateControlID()
  if (!globals.showSites){
    $("#Sites_control").trigger('click')
  }
  //bringMarkersToFront()
} //end update sites function

function removeSites(){
  globals.map.map.eachLayer(function(layer){
    if (layer.site){
      globals.map.map.removeLayer(layer)
    }
  })
}

function removePropSymbols(){
  globals.map.map.eachLayer(function(layer){
    if (layer.ps){
      globals.map.map.removeLayer(layer)
    }
  })
}

function removeHeatmap(){
  //just sets the lat/lngs of the heatmap to empty so we don't need to recreate the base layer
  globals.heat.setLatLngs([]);
}

function makeRadius(num){
  return Math.sqrt(num)
}

function loadIceSheets(){
  //get icesheet geojson
  $.ajax("data/icesheets.json", {
    dataType: "json",
        cache: true,
    error: function(xhr, status, error){
      console.log(xhr)
      console.log(status)
      console.log(error)
    },
    success: function(response){
      //load the icesheets
      //first, get a list of the years that we have in the ice dataset
      //use this in calculating which layer to show
      globals.iceAges = new Array()
      for (prop in response.features){
        iceAge = response.features[prop].properties.Age
        globals.iceAges.push(iceAge)
      }
      //now,display
      displayIceSheets(response)
    }
  })
}

function bringMarkersToFront(){
  for (var i=0; i< globals.siteMarkers.length; i++){
    marker = globals.siteMarkers[i];
    marker.bringToFront()
  }
}

function isVisible(layerName){
  //hackiest thing ever
  selectorDiv = $(".leaflet-control-layers-overlays")
  labs = selectorDiv.find("span")
  inputs = selectorDiv.find("input")
  visible = true
  for (var i =0; i< labs.length; i++){
    lab = $(labs[i]).text()
    if (lab == " " + layerName){
      visible = $(inputs[i]).prop('checked')
      break
    }
  }
  return visible
}

function updateControlID(){
  controls = $(".leaflet-control-layers-selector")
  selectorDiv = $(".leaflet-control-layers-overlays")
  labs = selectorDiv.find("span")
  inputs = selectorDiv.find("input")
  visible = true
  for (var i =0; i< labs.length; i++){
    lab = $(labs[i]).text().replace(" ", "")
    $(inputs[i]).attr('id', lab + "_control")
  }
}

function setVisibleBox(layerName){
  //turn on checkbox in layer control
  selectorDiv = $(".leaflet-control-layers-overlays")
  labs = selectorDiv.find("span")
  inputs = selectorDiv.find("input")
  visible = true
  for (var i =0; i< labs.length; i++){
    lab = $(labs[i]).text()
    if (lab == " " + layerName){
      visible = $(inputs[i]).prop('checked', true)
      break
    }
  }
}

function unsetVisibleBox(layerName){
  //turn off checkbox in layer controls
  selectorDiv = $(".leaflet-control-layers-overlays")
  labs = selectorDiv.find("span")
  inputs = selectorDiv.find("input")
  visible = true
  for (var i =0; i< labs.length; i++){
    lab = $(labs[i]).text()
    if (lab == " " + layerName){
      visible = $(inputs[i]).prop('checked', false)
      break
    }
  }
}


function displayIceSheets(data){
    globals.iceSheets = L.geoJson(data).addTo(globals.map.map)
    globals.map.layerController.addOverlay(globals.iceSheets, "Icesheets")
    updateControlID()
    styleIceSheets()
    if (!globals.showIce){
      $("#Icesheets_control").trigger('click')
    }
}
function closest (num, arr) {
    var curr = arr[0];
    var diff = Math.abs (num - curr);
    for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs (num - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
        }
    }
    return curr;
}

function styleIceSheets(){
  //get the closest ice layer
  globals.closestIceAge = closest(globals.maxYear, globals.iceAges)
    globals.iceSheets.eachLayer(function(layer){
      if (globals.maxYear < 4000){
        layer.setStyle({strokeColor: 'none', fillColor: "none", stroke: false})
      }
      else if (layer.feature.properties.Age == globals.closestIceAge){
        layer.setStyle({stroke: false, fillColor: '#E0FFFF', fillOpacity: 0.5})
      }else{
        layer.setStyle({strokeColor: 'none', fillColor: "none", stroke: false})
      }
    })
  globals.iceSheets.bringToBack();
}

function getTaxonomy(){
  globals.taxonomyStoppingCriteria = ["Plantae"]
  globals.taxonomy = []
  getTaxonInfoFromNeotoma(globals.taxonid)
}

function getTaxonInfoFromNeotoma(taxonid){
  endpoint = "http://api.neotomadb.org/v1/data/taxa?taxonid="
  url = endpoint + taxonid
  $.ajax(url, {
    error: function(xhr, status, error){
      console.log(xhr)
      console.log(status)
      console.log(error)
    },
    dataType:"jsonp",
    success: function(response){
      if (response['success']){
        info = response['data'][0]
        name = info['TaxonName']
        if (globals.taxonomyStoppingCriteria.indexOf(name) > -1){
          r = false
        }else{
          r = true
        }
        processTaxonInfo(info)
        if (r){
          higherID = info['HigherTaxonID']
          getTaxonInfoFromNeotoma(higherID)
        }else{
          displayTaxonomy();
        }
      }

    },
    beforeSend: function(jqXHR){
      jqXHR.setRequestHeader('Accept-Encoding', 'gzip');
    }
  })
}

function processTaxonInfo(taxonResponse){
  globals.taxonomy.push(taxonResponse);
}

function displayTaxonomy(){
  globals.taxonomy = globals.taxonomy.reverse()
  header = globals.taxon + " - taxonomy"
  $("#taxonomy-panel-title").html(header)
  html = ""
  for (var i=0; i< globals.taxonomy.length; i++){
    taxon = globals.taxonomy[i]
    html += "<h5 class='strong'>" + taxon.TaxonName + "</h5><i class='small'>" + taxon.Author + "</i>"
  } //end loop
  globals.taxonomyPanel.setContent(html)
  if (globals.openTaxPanel){
    globals.taxonomyPanel.open()
  }else{
    globals.taxonomyPanel.close()
  }
  movePanelToFront(globals.taxonomyPanel._container)
}

// //navigation stuff
// $(".nav-item").click(function(){
//   $(".nav-item").removeClass('active')
//   $(this).addClass('active')
//   $(".panel").hide()
//   isClicked = $(this).data('clicked')
//   if (!isClicked){
//     thePanel = $(this).data('panel')
//     if (thePanel == 'taxonomy'){
//       $("#taxonomy-panel").show()
//     }
//     else if (thePanel == 'site'){
//       $("#site-panel").show()
//     }
//     //other panel opening goes here
//
//
//     $(this).data('clicked', true)
//   }else{
//     $(this).data('clicked', false)
//     $(this).removeClass('active')
//   }
// })

function getSiteDetails(siteid){
  //make sure the popup is open
  globals.activeSiteID = siteid //so we can catch it later
  var endpoint = "http://api.neotomadb.org/v1/data/datasets?siteid="
  var url = endpoint + siteid
  url += "&taxonname=" + globals.taxon
  $.ajax(url, {
    cache: true,
    dataType: 'jsonp',
    error: function(xhr, status, error){
      console.log(xhr)
      console.log(status)
      console.log(error)
    },
    beforeSend: function(jqXHR){
        jqXHR.setRequestHeader('Accept-Encoding', 'gzip');
    },
    success: function(response){
      displaySiteDetails(response['data'])
    }
  })
}

function displaySiteDetails(details){
  //make sure the popup will open correctly
  globals.openSitePanel = true
  if (details.length == 0){
    return
  }
  site = details[0]['Site']
  siteLat = site['LatitudeNorth'] + site['LatitudeSouth'] / 2
  siteLng = site['LongitudeWest'] + site['LongitudeEast'] / 2
  siteName = site['SiteName']
  siteDesc = site['SiteDescription']
  siteAlt = site['Altitude']
  siteNotes = site['SiteNotes']
  siteID = site['SiteID']
  PIs = []
  ageOld = -Infinity
  ageYoung = Infinity
  subDates = []
  ages = []
  pcts = []
  for (var i=0; i< details.length; i++){
    //parse the datasets
    thisDataset = details[i]
    dates = thisDataset['SubDates']
    for (var j = 0; j < dates.length; j++){
      if (dates[j]['SubmissionDate'] != null){
        subDates.push(dates[j]['SubmissionDate'])
      }
    }
    thisPI = thisDataset['DatasetPIs']
    for (var p =0; p<thisPI.length; p++){
      if (thisPI[p].ContactName != null){
        PIs.push(thisPI[p].ContactName)
      }

    }
  }
  //associate with the  map data
  for (var i =0; i< globals.data.length; i++){
    occ = globals.data[i]
    if (occ.SiteID == siteID){//match to this site
      thisAge = occ.Age
      if ((thisAge == null) || (thisAge == undefined)){
        thisAge = (occ.AgeOlder + occ.AgeYounger)/2
      }
      if (occ[globals.TotalField] != null){
        pct = (occ.Value / occ[globals.TotalField]) * 100
      }else{
        pct = 0
      }

      obj = {age: thisAge, value: pct, id:occ.SampleID}
      ages.push(obj)
    }
  }

  ages = _.sortBy(ages, function(d){return d.age})
  numDatasets = details.length
  html = ""
  html +=  "<h4>" + site['SiteName'] + "<span class='small text-muted'><" + siteID + "></span></h4>"
  html += "<div>"
  html += "<p>Latitude: <span class='text-muted'>" + round2(siteLat) + "</span></p>"
  html += "<p>Longitude: <span class='text-muted'>" + round2(siteLng) + "</span></p>"
  html += "<p>Altitude: <span class='text-muted'>" + siteAlt + "m</span></p>"
  if (siteDesc != null){
    html += "<p>Site Description: <i class='text-muted small'>" + siteDesc + "</i></p>"
  }
  if (siteNotes != null){
    html += "<p>Site Notes: <i class='text-muted small'>" + siteNotes + "</i></p>"
  }
  html += "<hr />"
  html += "Samples at this Site: "
  html += "<table>"
  html += "<th>Sample ID</th><th>Age</th><th>Value</th>"
  for (var i =0; i< ages.length; i++){
    html += "<tr><td>" + ages[i].id + "</td><td>"  + ages[i].age + " B.P.</td><td>" + round2(ages[i].value) + "%</td><tr>"
  }
  html += "</table>"
  html += "<hr />"
  html += "<p>Datasets with " + globals.taxon + ":<span class='text-muted'>" + numDatasets + "</span></p>"
  html += "<h6>Investigators:</h6>"
  for (var p =0; p< PIs.length; p++){
    html += "<p><i class='text-muted small'>" + PIs[p] + "</i></p>"
  }
  html += "<h6>Neotoma Submission Dates:</h6>"
  for (var p =0; p< subDates.length; p++){
    html += "<p><i class='text-muted small'>" + subDates[p] + "</i></p>"
  }
  html += "</div>"
  globals.sitePanel.setContent(html)
  if (globals.openSitePanel){
    globals.sitePanel.open()
  }else{
    globals.sitePanel.close()
  }

  $(".leaflet-control-dialog-contents").scrollTop(0)
  movePanelToFront(globals.sitePanel._container)
  //make sure the popup is open, in case it was called by url
  for (var i=0; i< globals.siteMarkers.length; i++){
    siteMarkerID = globals.siteMarkers[i].siteID
    if (siteMarkerID == globals.activeSiteID){
      globals.siteMarkers[i].openPopup()
      break
    }
  }
}

function setTimelinePoints(data){
  d3.selectAll(".tl-point").remove()
  d3.select("#timeline").select("svg").selectAll(".tl-point")
    .data(data)
    .enter()
    .append('circle')
      .attr('class', 'tl-point')
      .attr('r', 1.5)
      .attr('fill','blue')
      .attr('cx', function(d){
          return 46
      })
      .attr('cy', function(d){
          age = d.Age
          if ((age == null) || (age == undefined)){
            age = (d.AgeOlder + d.AgeYounger) / 2
          }
          return globals.timeScale(age)
      })
}

function movePanelToFront(panel){
  openPanels = $(".leaflet-control-dialog")
  zs = []
  for (var i =0; i< openPanels.length; i++){
    p = $(openPanels[i])
    z = +p.css("z-index")
    zs.push(z)
  }
  maxZ = Math.max(...zs)
  newZ = maxZ + 1
  $(panel).css("z-index", newZ)
}

function round2(num){
  return Math.round(num * 100) / 100
}

function makeBaseNicheViewerPanel(){
  html = "<div class='col-xs-12' id='nv-controls'>"
  html += "<div class='col-xs-6' id='axis-1-controls'>"
  html += "<h4>X Axis</h4>"
  html += "<label>Data Source</label><br /><select id='x-source-dropdown' class='source-dropdown'></select></br />"
  html += "<label>Variable</label><br /><select id='x-variable-dropdown' class='variable-dropdown'></select><br />"
  // html += "<label>Variable Modifier</label><select id='x-modifier-dropdown' class='modifier-dropdown'></select><br />"
  html += "</div>"
  html += "<div class='col-xs-6' id='axis-2-controls'>"
  html += "<h4>Y Axis</h4>"
  html += "<label>Data Source</label><br /><select id='y-source-dropdown' class='source-dropdown'></select></br />"
  html += "<label>Variable</label><br /><select id='y-variable-dropdown' class='variable-dropdown'></select><br />"
  // html += "<label>Variable Modifier</label><select id='y-modifier-dropdown' class='modifier-dropdown'></select><br />"
  html += "</div>"
  html += "</div>"
  html += "<hr />"
  html += "<div id='nv-chart'>"
  html += "</div>"
  globals.nvPanel.setContent(html)
  if (globals.openNVPanel){
    globals.nvPanel.open()
  }else{
    globals.nvPanel.close()
  }
  $(".leaflet-control-dialog-contents").scrollTop(0)
  movePanelToFront(globals.nvPanel._container)
}
function onAllPanelResized(){
  //check the niche viewer dimensions
  newNVWidth = $(globals.nvPanel._container).width()
  newNVHeight = $(globals.nvPanel._container).height()
  if ((newNVHeight != globals.nvHeight) || (newNVWidth != globals.nvWidth)){
    //makeNicheViewer()
  }
}

function updateTime(){
  updateHeatmap()
  updateSites()
  styleIceSheets()
  //updateNicheViewer()
  //make sure the text boxes get the most recent values of years
  $("#maxYearSelect").val(Math.round(globals.maxYear))
  $("#minYearSelect").val(Math.round(globals.minYear))
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function generateShareURI(){
  //document all of the components of the current configuration so we can share it as a URI
  oldURI = new URI()
  protocol = oldURI.protocol()
  hostname = oldURI.hostname()
  port = oldURI.port()
  path = oldURI.pathname()
  uri = new URI({
    protocol: protocol,
    hostname: hostname,
    port:port,
    path: path
  })
  //get the name of what we're looking at
  taxon = globals.taxon
  if (taxon){
    uri.addQuery('taxon', taxon)
  }
  uri.addQuery('taxon', taxon)
  //get the map center and zoom
  center = globals.map.map.getCenter()
  lat = center['lat']
  lng = center['lng']
  zoom = globals.map.map.getZoom()
  uri.addQuery('lat', lat)
  uri.addQuery('lng', lng)
  uri.addQuery('zoom', zoom)
  //get time extent
  minyear = Math.round(globals.minYear)
  maxyear = Math.round(globals.maxYear)
  uri.addQuery('minYear', minyear)
  uri.addQuery('maxYear', maxyear)
  //get UI open components
  taxonomyIsOpen = globals.taxonomyPanel.isOpen
  nvIsOpen = globals.nvPanel.isOpen
  sitesIsOpen = globals.sitePanel.isOpen
  uri.addQuery('sitePanel', sitesIsOpen)
  uri.addQuery('nvPanel', nvIsOpen)
  uri.addQuery('taxonomyPanel',taxonomyIsOpen)
  //site panel only makes sense to be open if there are details about that site in it
  if (sitesIsOpen){
    activeSiteID = globals.activeSiteID
    uri.addQuery('activeSiteID', activeSiteID)
  }
  //get layers on the map
  siteLayerVisible = globals.showSites
  iceLayerIsVisible = globals.showIce
  heatmapIsVisible = globals.showHeat
  uri.addQuery('showSites', siteLayerVisible)
  uri.addQuery('showIce', iceLayerIsVisible)
  uri.addQuery('showHeat', heatmapIsVisible)
  //could generate a uniqueID here
  // shareID = generateShareID()
  // uri.addQuery('shareid',shareID)
  uri.normalizeQuery()
  return uri
}

function generateID() {
  //not really necessary now, but we could have a db on the backend that uses this, so put it in now
    return ("00000" + (Math.random()*Math.pow(36,5) << 0).toString(36)).slice(-5)
}

function processQueryString(){
  //called on load to process any variables that have been passed in through the url
  //set global variables, then call load()
  globals.autoload = false //if this is true, we automatically do the search to neotoma
  taxon = getURLParameterByName('taxon')
  if (taxon){
    globals.taxon = taxon
    //set the name in the search box
    $("#searchBar").val(taxon.toProperCase())
    globals.autoload = true;
  }
  minyear = getURLParameterByName('minYear')
  if (minyear){
    if (!isNaN(+minyear)){
          globals.minYear = +minyear
    }else{
      globals.minYear = -75
    }
  }else{
    globals.minYear = -75
  }

  maxyear = getURLParameterByName('maxYear')
  if (maxyear){
    if (!isNaN(+maxyear)){
      globals.maxYear = +maxyear
    }else{
      globals.maxYear = 22000
    }
  }else{
    globals.maxYear = 22000
  }
  //initialize some stuff.  This could go elsewhere, but other inits happen here, so we will leave it here
  globals.map.layers = {}
  globals.data = []
  globals.siteLayer = L.layerGroup();
  globals.iceSheets = L.layerGroup();
  globals.siteMarkers = []

  //default panel opening
  //default is off
  sitePanelOn = getURLParameterByName('sitePanel')
  if(sitePanelOn == 'true'){
    globals.openSitePanel = true
    //if this is true, there should be an activeSiteID param too
    activeSiteID = getURLParameterByName('activeSiteID')
    if (activeSiteID){
      if ((!isNaN(activeSiteID)) && (+activeSiteID > 0)){
        globals.activeSiteID = activeSiteID
        getSiteDetails(globals.activeSiteID)
      }else{
        globals.activeSiteID = null
        globals.openSitePanel = false //don't allow auto open unless an id is set
      }
    }else{
      globals.activeSiteID = null
      globals.openSitePanel = false //don't allow auto open unless an id is set
    }
  }else{
    globals.openSitePanel = false;
  }

  nvPanelOn = getURLParameterByName('nvPanel')
  if(nvPanelOn == 'true'){
    globals.openNVPanel = true
  }else{
    globals.openNVPanel = false;
  }

  taxonomyPanelOn = getURLParameterByName('taxonomyPanel')
  if(taxonomyPanelOn == 'true'){
    globals.openTaxPanel = true
  }else{
    globals.openTaxPanel = false
  }

  //get map view
  centerLat = getURLParameterByName('lat')
  if (centerLat){
    if (!isNaN(+centerLat)){
      globals.centerLat = centerLat
    }else{
        globals.centerLat = 39.828175
    }
  }else{
    globals.centerLat = 39.828175
  }
  centerLng = getURLParameterByName('lng')
  if (centerLng){
    if (!isNaN(+centerLng)){
      globals.centerLng = centerLng
    }else{
      globals.centerLng = -98.5795
    }

  }else{
    globals.centerLng = -98.5795
  }
  zoom = getURLParameterByName('zoom')
  if (zoom){
    if (!isNaN(+zoom)){
      globals.zoom = zoom
    }else{
      globals.zoom = 3
    }
  }else{
    globals.zoom = 3
  }

  showIce = getURLParameterByName("showIce")
  if (showIce == "false"){
    globals.showIce = false
  }else{
    globals.showIce = true
  }

  showHeat = getURLParameterByName('showHeat')
  if (showHeat == 'false'){
    globals.showHeat = false
  }else{
    globals.showHeat = true
  }
  showSites = getURLParameterByName('showSites')
  if (showSites == 'false'){
    globals.showSites = false;
  }else{
    globals.showSites = true;
  }

  //advanced parameters.  There are no GUI elements to change these, yet, but it gives the option to change if desired
  sumField = getURLParameterByName("sumField")
  if (sumField){
    sumField = sumField.toLowerCase()
    if(sumField == "total"){
      globals.TotalField = "Total"
    }else if (sumField == 'uphe'){
      globals.TotalField = "UPHE"
    }else if (sumField == "unid"){
      globals.TotalField = "UNID"
    }else if (sumField == "upbr"){
      globals.TotalField = "UPBR"
    }else if (sumField == "fung"){
      globals.TotalField = "FUNG"
    }else if (sumField == "trsh"){
      globals.TotalField = "TRSH"
    }else if (sumField == "aqvp"){
      globals.TotalField = "AQVP"
    }else if (sumField == "aqbr"){
      globals.TotalField = "AQBR"
    }else if (sumField == "vacr"){
      globals.TotalField = "VACR"
    }else if (sumField == "anac"){
      globals.TotalField = "ANAC"
    }else if (sumField == "palm"){
      globals.TotalField = "PALM"
    }else if (sumField == "succ"){
      globals.TotalField = "SUCC"
    }else{
      globals.TotalField = "Total"
    }
  }else{
    globals.TotalField = "Total"
  }

  //single taxon or aggregate down?
  aggType = getURLParameterByName("aggType")
  if (aggType){
    if (aggType == "single"){
      globals.aggType = "single"
    }else if ((aggType == "base") || (aggType == "multiple")){
      globals.aggType = "base"
    }else{
      globals.aggType = "base"
    }
  }else{
    globals.aggType = "single"
  }
  //heatmap options

  heatMax = getURLParameterByName("heatMax")
  if(heatMax){
    if (!isNaN(parseFloat(heatMax))){
      globals.heatMax = heatMax
    }else{
      globals.heatMax = 100
    }
  }else{
    globals.heatMax = 100
  }

  globals.heatOptions['max'] = globals.heatMax

  heatCellSize = getURLParameterByName("heatCellSize")
  if(heatMax){
    if (!isNaN(parseFloat(heatCellSize))){
      globals.heatCellSize = heatCellSize
    }else{
      globals.heatCellSize = 100
    }
  }else{
    globals.heatCellSize = 100
  }
  globals.heatOptions['cellSize'] = globals.heatCellSize



  //go!
  if (globals.autoload){
    $("#searchButton").trigger('click'); //load the map components
  }
}

function getURLParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};




function copyLinkToClipboard() {
	  // create hidden text element, if it doesn't already exist
   $("#share-link").focus()
   var succeed;
   try{
     succeed = document.execCommand("copy")
   }catch(e){
     succeed = false
   }
   return succeed
}

//social media sharing of the share link
$("#copyToClipboard").on('click', function(){
  copyLinkToClipboard()
})

//enable extra bootstrap functionality
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
$(function () {
  $('[data-toggle="popover"]').popover()
})


function generateTwitterLink(){
  var twitterURL = new URI("http://twitter.com/share/")
  twitterURL.addQuery("url", globals.shareURI)
  twitterURL.addQuery("text", "Check out my Ice Age Map!")
  twitterURL.addQuery("hashtags", "paleo")
  twitterURL = twitterURL.toString()
  $(".twitter-share-button").attr("href", twitterURL)
}

function generateEmailLink(){
  link = "mailto:?to=&"
  link += "subject=" + encodeURIComponent("Ice Age Mapper")
  link += "&body=" + globals.shareURI
  $("#emailLink").data('href', link)
}

function generateGPlusLink(){
  $(".g-plus").data('href', globals.shareURI)
}


function changeHeatmapSymbology(type){
  if (type == 'relative'){
    globals.heatmapSymbology = 'relative'
  }else if (type == 'absolute'){
    globals.heatmapSymbology = 'absolute'
  }
  updateHeatmap()
}
//change the heatmap maximum value
$(".heatmapSymbologyInput").change(function(){
  val = $(this).val()
  changeHeatmapSymbology(val)
})

function changeTotalField(totalField){
  globals.TotalField = totalField
  updateHeatmap()
  getSiteDetails(globals.activeSiteID)
}


function populateTotalFieldDialog(){
  workingItem = globals.data[0]
  reservedFields = ['Value', "Age", "AgeOlder", "AgeYounger", "Altitude", "DatasetID", "LatitudeNorth", "LatitudeSouth",
                  "LongitudeWest", "LongitudeEast", "SampleID", "SampleID1", "SiteID", "TaxonID", "VariableUnits", "Total", "TaxonName", "SiteName"]
  for (key in workingItem){
    if (reservedFields.indexOf(key) == -1){
      $("#totalControl").append("<option value='" + key + "'>" + key + "</option>")
    }
  }
  $("#totalControl").change(function(){
    newField = $("#totalControl option:selected").val()
    changeTotalField(newField)
    console.log("New Field is " + newField)
  })
}
