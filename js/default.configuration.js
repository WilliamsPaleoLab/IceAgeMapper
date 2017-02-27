defaultConfiguration = {
  config : {
    //this holds rules for static configuration of the application
    //variables go in here if they will be consistent from session to session and user to user
    map: {
      primaryTileURL: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', //where to go to get tiles
      style: "mapbox://styles/sfarley2/ciz3ab6a2003d2spd7nqf02ax",
      defaultContainerName: "map",
      mapboxToken: "pk.eyJ1Ijoic2ZhcmxleTIiLCJhIjoiY2lmeWVydWtkNTJpb3RmbTFkdjQ4anhrMSJ9.jRJCOGU1AOHfNXHH7cwU7Q",
      maxZoom: 8, //max zoom level of map
      attribution: "",
      mapOptions: {
        zoomControl: false,
        maxZoom: 8
      },
      //marker cluster controls
      doMarkerClustering: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      sizeRMin: 15,  //minimum radius of the proportional Symbols
      sizeRMax: 100, // maximum radius of the proportional symbols
      maxClusterRadius: 50,//maximum size of the cluster in screen pixels (spans all zoom levels),
      clusterFill: 'steelblue',
      markerFill: 'steelblue',
      markerRadius: 6,
      bearing: 0,
      pitch: 0,
      symbolColor: {
        "property": "VariableUnits",
        "type": "categorical",
        "stops": [
            ["present/absent", "#fbb03b"],
            ["NISP", "steelblue"],
            ["MNI", "#e55e5e"]
        ]
    },
      symbolRadius: 5,
      popupTextFunction: function(d){
        dsMeta = JSON.parse(d.properties.DatasetMeta)
        html = "<h6>" + dsMeta.Site.SiteName + "</h6>"
        html += "<a onclick='openSiteDetails(" + dsMeta.Site.SiteID + ")'>Details</a>"
        return html
      }
    }, //end map
    dataSources: { //URIs of data used in AJAX calls
      taxa: "data/taxa.json", //customized file with names of taxa to improve performanc
      ecolGroups: "http://api.neotomadb.org/v1/dbtables/ecolGroupTypes?fields=EcolGroupID,EcolGroup", //names and ids of ecological groups in neotoma
      occurrences: "http://api.neotomadb.org/v1/data/SampleData", //endpoint for occurrence data
      datasets: "http://api.neotomadb.org/v1/data/datasets", //endpoint for dataset metadata
      sites: "http://api.neotomadb.org/v1/data/sites",//endpoint for site-level meta
      configStore: "http://grad.geography.wisc.edu:8080/mapConfigs",//where shared maps are stored
      taxonInfo: "http://api.neotomadb.org/v1/data/taxa"
    },
    searchGeoBounds: [-167, 5, -50, 90], //corresponds to the `loc` parameter in the Neotoma API
    searchAgeBounds: [-250, 22000], //corresponds to the ageYoung and ageOld parameters in the Neotoma API
    layout: {
      southPanelSize: '25%', //percent of page width for bottom panel
      eastPanelSize: '50%', //percent of page width for analytics panel
      westPanelSize: '25%', //percent of page width for left (site details) panel
      southPanelResizable: true, //can you resize the bottom panel?
      eastPanelResizable: true, //can you resize the right hand panel?
      westPanelResizable: true, //can you resize the left hand panel?
      southPanelClosable: true, //can you close the bottom panel?
      eastPanelClosable: true, //can you close the right hand panel?
      westPanelClosable: true //can you close the left hand panel?
    },
    analytics: {
      //controls for analytics charts on right hand panel
      latitudeDomainMin: 0, //min of latitude bar chart axis
      latitudeDomainMax: 90, //max of latitude bar chart axis
      latitudeDomainResolution: 2.5,
      altitudeDomainMin: 0, //min of altitude bar chart axis
      altitudeDomainMax: 5000, //max of altitude bar chart axis
      abundanceDomainMin: 0, //min of abundance axis
      abundanceDomainMax: 100,//max of abundance axis
      timeDomainMin: 0, //min of time bar chart axis
      timeDomainMax: 22000, //max of time bar chart axis
      colorYoung: "blue", //color to represent earliest dates on bubble chart
      colorOld:'red', //color to represent oldest dates on bubble chart
      timeBinSize: 1, //how big are the time bins in the analytics charts? --> years
      latitudeBinSize: 0.5, //how big are the latitude bins in the analytics charts? --> degrees
      abundanceBinSize: 1,//how big are the abundance bins in the analytics charts? --> TODO: this gets weird with mammal/pollen percent.
      altitudeBinSize: 500 //altitude bins --> meters
    },
    colors: {
      tempCurve: 'red',
      tempAgeHist: 'none',
      annotations: '#9A9C9E'
    },
    doAnnotations: true,
    baseURL: "iam.html"
  },//end config

  state : {//this holds all relevant info to be shared and saved.
    //variables go in here if they might be modified by the user during a session
    sitePanel : { //left-hand panel configuration that holds details about the user-selected site
      open: false, //is the panel open?
      siteID: -1,//database ID of the site the user selected
    },
    timePanel :{ //bottom panel that contains temporal brushing and browsing
      axis: 1, //multiple y-axes may be chosen, each with the same x-axis --> browsing is the same
              //1. Greenland Northern Hemisphere Temprature
              //2. Number of Samples per 500 Years --> histogram layout
    },
    time : { //temporal filter controls
      minYear: -Infinity, //most recent year in current filter
      maxYear: Infinity, //most distant year in current filter
      interval: Infinity //the interval in years between min and max years, so the user can set only one of the above
    },
    map : { //main map panel configuration
      center: [-90, 45], //center of the map
      zoom: 3, //zoom level of map
      showIce: true, //show the ice sheets during browsing
      currentRMin: 0,
      currentRMax: 0
    },
    analytics: { //right hand panel with analytics charts
      open: false //is the panel open?,
    },
    layout: {
      eastPanelIsOpen: true,
      southPanelIsOpen: true,
      westPanelIsOpen: false
    },
    taxonsearch: null,
    taxonid: 0,
    taxonname: "",
    doSearch: false,
    openSite: false,
    activeSiteID: null,
    filters: {
      age: null,
      latitude: null,
      altitude: null,
      investigator: null,
      recordType: null,
      singleSite: null,
      abundance: null
    },
   searchSwitch: "browse"
  }//end state
} //end default configuration
