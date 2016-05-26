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
  globals.map.map = L.map('map', {zoomControl:false}).setView([39.828175, -98.5795], 5);

  L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
  	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
  	maxZoom: 8,
    minZoom: 3,
  }).addTo(globals.map.map);
  createLayerController() //creates an empty layer controller

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

  var minYear = 0;
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
         .attr('transform', 'rotate(-90 -5,' + height / 2 + ')')


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
       console.log("Success!")
       if (data['success']){
        globals.data = dataset= data['data']
         console.log(dataset)
         $("#loading").slideUp()
         //determine what to do with the data
         updateHeatmap()
         updateSites()
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
}
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
$(".nav-item").click(function(){
  $(".nav-item").removeClass('active')
  $(this).addClass('active')
})


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
  visible = false
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
  //globals.iceVisible = isVisible("Icesheets")
  //globals.map.layerController.removeLayer(globals.iceSheets)
  globals.iceSheets = L.geoJson(data).addTo(globals.map.map)
  // if (!globals.iceVisible){
  //   globals.map.map.removeLayer(globals.iceSheets);
  // }
  globals.map.layerController.addOverlay(globals.iceSheets, "Icesheets")
  //see which layers are visible
  // globals.iceSheets.eachLayer(function(layer){
  //   console.log(layer)
  //   age = layer.feature.properties.Age
  //   if ((age >= globals.minYear) && (age <= globals.maxYear)){
  //     //pass
  //   }
  // })
  styleIceSheets()
}

function styleIceSheets(){
  globals.iceSheets.eachLayer(function(layer){
    console.log(layer)
    if ((layer.feature.properties.Age >= globals.minYear)
    && (layer.feature.properties.Age <= globals.maxYear)){
      layer.setStyle({stroke: false, fillColor: '#E0FFFF'})

    }else{
      layer.setStyle({strokeColor: 'none', fillColor: "none", stroke: false})
    }
  })
}
