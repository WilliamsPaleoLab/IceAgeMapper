var config = {
  config : {
    //this holds rules for static configuration of the application
    //variables go in here if they will be consistent from session to session and user to user
    map: {
      style: "mapbox://styles/sfarley2/ciz3ab6a2003d2spd7nqf02ax", //style of the map tiles
      defaultContainerName: "map", //container where the map goes
      mapboxToken: "pk.eyJ1Ijoic2ZhcmxleTIiLCJhIjoiY2lmeWVydWtkNTJpb3RmbTFkdjQ4anhrMSJ9.jRJCOGU1AOHfNXHH7cwU7Q", //Mapbox.com API key
      bearing: 0, //direction of map view
      pitch: 0, //pitch of map view
      symbolColor: { //symbol paint properties passed to mapbox/map.layer
        "property": "VariableUnits",
        "type": "categorical",
        "stops": [
            ["present/absent", "#fbb03b"],
            ["NISP", "steelblue"],
            ["MNI", "#e55e5e"]
        ]
    },
      symbolRadius: 5 //size of the map points
    }, //end map

    //where is the data stored
    dataSources: { //URIs of data used in AJAX calls
      taxa: "data/taxa.json", //customized file with names of taxa to improve performanc
      ecolGroups: "http://api.neotomadb.org/v1/dbtables/ecolGroupTypes?fields=EcolGroupID,EcolGroup", //names and ids of ecological groups in neotoma
      occurrences: "http://api.neotomadb.org/v1/data/SampleData", //endpoint for occurrence data
      datasets: "http://api.neotomadb.org/v1/data/datasets", //endpoint for dataset metadata
      sites: "http://api.neotomadb.org/v1/data/sites",//endpoint for site-level meta
      configStore: "http://grad.geography.wisc.edu:8080/mapConfigs",//where shared maps are stored
      taxonInfo: "http://api.neotomadb.org/v1/data/taxa", //details about specific taxa
      icesheets: "data/icesheets.json"//geojson representing paleoicesheets
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
    //default colors of interface elements
    colors: {
      tempCurve: 'red', //
      tempAgeHist: 'none', //histogram below the tempCurve (invisible)
      annotations: '#9A9C9E' //color of annotations on the temp curve
    },
    doAnnotations: true, //should annotations about time periods be put into the tempCurve?
    baseURL: "iam.html" //where does the *map* reside? e.g., what is this page?
  },//end config

  state : {//this holds all relevant info to be shared and saved.
    //variables go in here if they might be modified by the user during a session
    map : { //main map panel configuration
      center: [-90, 45], //center of the map
      zoom: 3, //current zoom level of map
      pitch: 0, //current angle of the map
      bearing: 0 //current direction of the map
    },
    layout: {
      eastPanelIsOpen: true, //is the analytics panel currently open?
      southPanelIsOpen: true, //is the temperature curve panel currently open?
      westPanelIsOpen: false //is the site panel currently open?
    },
    taxonsearch: null,
    taxonid: 0, //Neotoma ID number of the taxon currently on the map
    taxonname: "", //Name of the taxon currently on the map
    doSearch: false, //should the query to neotoma be fired automatially? True if pre-configured with data from config or url param
    openSite: false, //should the site panel be open?
    activeSiteID: null, //ID number of the site currently open in the sitePanel
    activeSite: {}, //details of the site currently open in the sitePanel
    //active filters currently applied to the map
    filters: {
      age: null, //years BP (will be array of [min, max])
      latitude: null, //degrees north ([min, max])
      altitude: null, //meters a.s.l ([min, max])
      investigator: null, //name of investigator (array of names)
      recordType: null, //type of sample record (array of types )
      singleSite: null, //list of siteIDs to be filtered
      abundance: null //relative abundance filter ([min, max])
    },
   searchSwitch: "browse", //is the query to neotoma a search or a browse? if search, query neotoma for taxonname, so wildcards are permitted, else query for taxonid
   shareToken: "" //share token to recreate this configuration
  }//end state
}; //end default configuration
