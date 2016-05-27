globals = {}
globals.map = {}
globals.minYear = 0
globals.maxYear = 22000
globals.visibleLayers = ['heatmap', 'sites', 'ice']
globals.map.layers = {
  //'Heatmap' : undefined//,
  // 'Sites' : undefined,
  // 'Icesheets' : undefined
}
globals.TotalField = "Total"
globals.data = []
globals.siteLayer = L.layerGroup();
globals.iceSheets = L.layerGroup();
globals.sitesVisible = true;

globals.taxonID = -1
globals.taxon = ""

heatOptions = {
  radius: 17,
  minOpacity: 0.5,
  max: 100,
  blur: 30,
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
$(document).keypress(function(e){
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
  createMap(); // load the leaflet map
  loadTaxaFromNeotoma(createSearchWidget) // load the taxa endpoint from neotoma and create an autocomplete search out of it
  createHeatmapLayer() // create a blank layer that we can load into later
  createTimeline();
  loadIceSheets()
})

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
  createLayerController() //creates an empty layer controller
  createToolbar()
  createSitePanel()
  createTaxonomyPanel()
  createNicheViewerPanel()
  //panel events
  $(".leaflet-control-dialog").on('mousedown', function(){
     movePanelToFront(this)
  })
}

function createSitePanel(){
  globals.sitePanel = L.control.dialog({anchor: [180, 25], initOpen: false})
              .setContent("<h6>Click on a site to retrieve details about it.")
              .addTo(globals.map.map)
  globals.sitePanel.name = "SitePanel"
}

function createTaxonomyPanel(){
  globals.taxonomyPanel = L.control.dialog({ anchor: [150, -5], initOpen: false})
    .setContent("<h6>Search for a taxon to retrieve its taxonomic hierarchy.</h6>")
    .addTo(globals.map.map)
    globals.taxonomyPanel.name = "TaxonomyPanel"
}

function createNicheViewerPanel(){
  globals.nvPanel = L.control.dialog({ anchor: [400, -5], maxSize: [500, 500], size: [500,500], initOpen: false})
    .setContent("<h6>NicheViewer Not yet implemented.</h6>")
    .addTo(globals.map.map)
    globals.taxonomyPanel.name = "NV"
}

function createToolbar(){
  var NicheViewerToolAction = L.ToolbarAction.extend({
      options: {
          toolbarIcon: {
              html: "<span class='glyphicon glyphicon-signal'></span>",
              tooltip: 'Open Niche Viewer Panel',
              class:'toolbar-item'
          }
      },
      addHooks: function () {
          globals.nvPanel.open()
          movePanelToFront(globals.nvPanel._container)
      }
  });
  var TaxonomyToolAction = L.ToolbarAction.extend({
      options: {
          toolbarIcon: {
              html: "<span class='glyphicon glyphicon-option-vertical'></span>",
              tooltip: 'Open Taxonomy Panel',
              class:'toolbar-item'
          }
      },
      addHooks: function () {
          globals.taxonomyPanel.open()
      }
  });
  var SiteToolAction = L.ToolbarAction.extend({
      options: {
          toolbarIcon: {
              html: "<span class='glyphicon glyphicon-globe'></span>",
              tooltip: 'Open Site Details Panel',
              class:'toolbar-item'
          }
      },
      addHooks: function () {
          //globals.map.map.setView([48.85815, 2.29420], 19);
            globals.sitePanel.open();
      }
  });

  globals.toolbar = new L.Toolbar.Control({
      actions: [NicheViewerToolAction, SiteToolAction, TaxonomyToolAction], position: 'topright'
  }).addTo(globals.map.map);
}

function createLayerController(){
  //create the layer controls
  globals.map.layerController = L.control.layers(null, globals.map.layers, {position: 'topright'})
    .addTo(globals.map.map)
}



function loadTaxaFromNeotoma(callback){
  //load all of the vascular plant taxa from the neotoma database
  $.ajax("http://api.neotomadb.org/v1/data/taxa?taxagroup=VPL", {
    beforeSend: function(){
      console.log(this.url)
      $("#loading").show();
    },
    dataType: "jsonp",
    error: function(xhr, status, error){
      console.log(xhr)
      console.log(status)
      console.log(error)
    },
    success: function(data){
      console.log("Success!")
      console.log(data)
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
  console.log(names)
  var input = document.getElementById("searchBar");
  var awesomplete = new Awesomplete(input, {
    minChars: 0,
    maxItems: 5,
    autoFirst: true
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
  var margins = {top: 5, left: 30, right: 5, bottom: 5}
  var height = $("#timeline").height() - margins.top - margins.bottom;
  var width = $("#timeline").width() - margins.left - margins.right;

  var minYear = -75;
  var maxYear = 22000;


  globals.timeScale = d3.scale.linear()
    .domain([minYear, maxYear])
    .range([0, height]);

    var initialMaxYear = Math.round(globals.timeScale.invert(250));

    globals.maxYear = initialMaxYear;
    globals.minYear = 0;


  var svg = d3.select("#timeline")
    .append("svg")
      .attr('width', width + margins.right + margins.left)
      .attr('height', height + margins.top + margins.bottom)
      .append("g")
        .attr("transform", "translate(50," + margins.top + ")");


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
      .attr('y', 0)
      .attr('height', 250)
      .attr('width', 5)
      .style('fill', '#3f7e8a')
      .style('stroke', 'black')
      .attr('cursor', 'ns-resize')

    globals.timeTop = svg.append('line')
      .attr('x1', 0)
      .attr('x2', 10)
      .attr('y1', 0)
      .attr('y2', 0)
      .style('stroke', 'black')
      .style('stroke-width', 5)
      .style('stroke-opacity', 0.5)
      .attr('cursor', 'ns-resize')

    globals.timeBottom = svg.append('line')
      .attr('x1', 0)
      .attr('x2', 10)
      .attr('y1', 250)
      .attr('y2', 250)
      .style('stroke', 'black')
      .style('stroke-width', 5)
      .style('stroke-opacity', 0.5)
      .attr('cursor', 'ns-resize')

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
        updateHeatmap()
        updateSites()
        styleIceSheets()
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
        updateHeatmap()
        updateSites()
        styleIceSheets()
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
          updateHeatmap()
          updateSites()
          styleIceSheets()
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

  //end createTimeline function
}

function loadOccurrenceData(taxon){
  globals.taxon =taxon
  $("#loading").show()
  loc = "-167.276413,5.49955,-52.23304,83.162102"
  $.ajax("http://apidev.neotomadb.org/v1/data/pollen?taxonname=" + taxon + "&bbox=" + loc, {
     beforeSend: function(){
       console.log(this.url)
       $("#loading").slideDown()
     },
     error: function(xhr, status, error){
       console.log(xhr)
       console.log(status)
       console.log(error)
       $("#loading").text("Server error.")
     },
     dataType: "jsonp",
     success: function(data){
       if (data['success']){
         console.log("Success!")
        globals.data = data['data']
        console.log(data['data'])
        if (data['data'].length == 0){
          alert("No results were returned.")
          $("#loading").slideUp()
          return
        }
        globals.taxonid = data['data'][0]['TaxonID']
        $("#loading").slideUp()
         //determine what to do with the data
         updateHeatmap()
         updateSites()
         getTaxonomy()
         setTimelinePoints(data['data'])
         globals.sitePanel.close()
         globals.nvPanel.close()
       }else{
         console.log("Server error on Neotoma's end.")
         $("#loading").text("Server error.")
       }
     }
  })
}

function createHeatmapLayer(){
  //create a blank heatmap layer
  console.log("Creating heatmap layer.")
  var heat = L.heatLayer([], heatOptions);
  heat.addTo(globals.map.map);
  globals.map.layers['Heatmap'] = heat;
  globals.heat = heat;
}

function updateHeatmap(){
  //update the data array
  dataset = _.filter(globals.data, function(d){
    if ((+d.Age == null) || (+d.Age == "")){
      d.Age = (+d.AgeOlder + d.AgeYounger)/2
    }
    return ((+d.Age > globals.minYear) && (+d.Age <= globals.maxYear));
  })
  dataset = _.map(dataset, function(d){
    pollenPercentage = (d['Value'] / d[globals.TotalField]) * 100
    return [(+d.LatitudeNorth + +d.LatitudeSouth)/2, (+d.LongitudeEast + +d.LongitudeWest)/2, pollenPercentage];
  })
  //remove from layer control if its already defined
  if (globals.heat != undefined){
    globals.map.layerController.removeLayer(globals.heat)
  }
  globals.heatmapData = dataset;
  globals.heat.setLatLngs(dataset);
  globals.heat.redraw();
  globals.map.layerController.addOverlay(globals.heat, "Heatmap") //add layer to controller
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
      pct = s.Value / s[globals.TotalField] * 100
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
    siteLayer.push(l)
    l.on('click', function(){
      console.log(this)
      var siteid = this._latlng.alt
      getSiteDetails(siteid);
      globals.map.map.setView(this._latlng)
      movePanelToFront(globals.sitePanel._container)
    })
  }
  //see if visible
  //hackiest thing ever
  globals.sitesVisible = isVisible("Sites")
  console.log("Sites are visible: " + globals.sitesVisible);
  globals.map.layerController.removeLayer(globals.siteLayer)
  globals.siteLayer = L.layerGroup(siteLayer).addTo(globals.map.map)
  if (!globals.sitesVisible){
    globals.map.map.removeLayer(globals.siteLayer);
  }
  globals.map.layerController.addOverlay(globals.siteLayer, "Sites")
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
  $.ajax("icesheets.json", {
    dataType: "json",
    error: function(xhr, status, error){
      console.log(xhr)
      console.log(status)
      console.log(error)
    },
    success: function(response){
      //load the icesheets
      console.log("Got icesheet data.")
      displayIceSheets(response)
    }
  })
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

function displayIceSheets(data){
  globals.iceSheets = L.geoJson(data).addTo(globals.map.map)
  globals.map.layerController.addOverlay(globals.iceSheets, "Icesheets")
  styleIceSheets()
}

function styleIceSheets(){
  globals.iceSheets.eachLayer(function(layer){
    if ((layer.feature.properties.Age >= globals.minYear)
    && (layer.feature.properties.Age <= globals.maxYear)){
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
    beforeSend: function(){
      console.log(this.url)
    }
  })
}

function processTaxonInfo(taxonResponse){
  globals.taxonomy.push(taxonResponse);
}

function displayTaxonomy(){
  globals.taxonomy = globals.taxonomy.reverse()
  html = "<h3>" + globals.taxon + ": <span class='text-muted'>Taxonomy</span></h3>"
  for (var i=0; i< globals.taxonomy.length; i++){
    taxon = globals.taxonomy[i]
    html += "<h5 class='strong'>" + taxon.TaxonName + "</h5><i class='small'>" + taxon.Author + "</i>"
  } //end loop
  globals.taxonomyPanel.setContent(html)
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
  var endpoint = "http://api.neotomadb.org/v1/data/datasets?siteid="
  var url = endpoint + siteid
  url += "&taxonname=" + globals.taxon
  $.ajax(url, {
    dataType: 'jsonp',
    error: function(xhr, status, error){
      console.log(xhr)
      console.log(status)
      console.log(error)
    },
    success: function(response){
      displaySiteDetails(response['data'])

    },
    beforeSend: function(){
      console.log("Sending site details request.")
    }
  })
}

function displaySiteDetails(details){
  //make sure the popup will open correctly
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
  for (var i=0; i< details.length; i++){
    thisDataset = details[i]
    console.log(thisDataset)
    thisOld = thisDataset.AgeOldest
    thisYoung = thisDataset.AgeYoungest
    if (thisOld > ageOld){
      ageOld = thisOld
    }
    if (thisYoung < ageYoung){
      ageYoung = thisYoung
    }
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

  numDatasets = details.length
  html = "<div>"
  html += "<h4><span class='strong'>" + siteName + "</span><i class='right small'>" + siteID + "</i></h4>"
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
  html += "<p>Datasets with " + globals.taxon + ":<span class='text-muted'>" + numDatasets + "</span></p>"
  // html += "<p>Youngest Occurrence: <span class='text-muted'>" + ageYoung + "  B.P.</span></p>"
  // html += "<p>Oldest Occurrence: <span class='text-muted'>" + ageOld + "  B.P.</span></p>"
  // html += "<hr />"
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
  movePanelToFront(globals.sitePanel._container)
}

function setTimelinePoints(data){
  console.log(data)
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
