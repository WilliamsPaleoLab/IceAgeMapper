
globals = {}

globals.data = {} //all data gets held here

globals.filters = {} //holds crossfilters

globals.config = {
  //this holds rules for static configuration of the application
  //variables go in here if they will be consistent from session to session and user to user
  map: {
    primaryTileURL: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', //where to go to get tiles
    maxZoom: 8, //max zoom level of map
  }, //end map
  dataSources: {
    taxa: "data/taxa.json",
    ecolGroups: "http://api.neotomadb.org/v1/dbtables/ecolGroupTypes?fields=EcolGroupID,EcolGroup",
    occurrences: "http://api.neotomadb.org/v1/data/SampleData"
  },
  searchSwitch: "search",
  searchGeoBounds: [-167, 5, -50, 90],
  searchAgeBounds: [-250, 22000],
  layout: {
    southPanelSize: '25%',
    eastPanelSize: '30%',
    westPanelSize: '25%',
    southPanelResizable: false,
    eastPanelResizable: false,
    westPanelResizable: false,
    southPanelClosable: false,
    eastPanelClosable: true,
    westPanelClosable: true
  }
}//end config



globals.state = {//this holds all relevant info to be shared and saved.
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
    center: [30, -90], //center of the map
    zoom: 3, //zoom level of map
    showIce: true, //show the ice sheets during browsing
  },
  analytics: { //right hand panel with analytics charts
    open: false //is the panel open?
  },
  layout: {
    eastPanelIsOpen: true,
    southPanelIsOpen: true,
    westPanelIsOpen: false
  }
}

globals.elements = {} //dom elements we should keep track of
