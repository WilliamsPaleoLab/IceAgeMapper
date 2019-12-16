var config  = (function(){
  //this holds rules for static configuration of the application
  //variables go in here if they will be consistent from session to session and user to user

  return {
    meta: {
      version: 2.1,
      author: "Scott Farley",
      title: "Ice Age Mapper"
    },
    map : {
      style: "mapbox://styles/sfarley2/ciz3ab6a2003d2spd7nqf02ax", //style of the map tiles
      defaultContainerName: "map", //container where the map goes
      mapboxToken: "pk.eyJ1Ijoic2ZhcmxleTIiLCJhIjoiY2lmeWVydWtkNTJpb3RmbTFkdjQ4anhrMSJ9.jRJCOGU1AOHfNXHH7cwU7Q", //Mapbox.com API key
      bearing: 0, //direction of map view
      pitch: 0, //pitch of map view
      symbolColor: { //symbol paint properties passed to mapbox/map.layer
        "property": "VariableUnits",
        "type": "categorical",
        "stops": [
            ["present/absent", "#1b9e77"],
            ["NISP", "#d95f02"],
            ["MNI", "#7570b3"]
        ]
    },
      symbolRadius: 5 //size of the map points
    }, //end map

    //where is the data stored
    dataSources : { //URIs of data used in AJAX calls
      taxa: "data/taxa.json", //customized file with names of taxa to improve performanc
      ecolGroups: "https://api.neotomadb.org/v1/dbtables/ecolGroupTypes?fields=EcolGroupID,EcolGroup", //names and ids of ecological groups in neotoma
      occurrences: "https://api.neotomadb.org/v1/data/SampleData", //endpoint for occurrence data
      datasets: "https://api.neotomadb.org/v1/data/datasets", //endpoint for dataset metadata
      sites: "https://api.neotomadb.org/v1/data/sites",//endpoint for site-level meta
      configStore: "http://grad.geography.wisc.edu:8080/mapConfigs",//where shared maps are stored
      taxonInfo: "https://api.neotomadb.org/v1/data/taxa", //details about specific taxa
      icesheets: "data/icesheets.json",//geojson representing paleoicesheets
      NHTemp: "data/greenlandT.csv", //northern hemisphere ice core temperature record for plottings
    },
    searchGeoBounds : [-167, 5, -50, 90], //corresponds to the `loc` parameter in the Neotoma API
    searchAgeBounds : [-250, 22000], //corresponds to the ageYoung and ageOld parameters in the Neotoma API
    layout : {
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
    analytics : {
      //controls for analytics charts on right hand panel
      latitudeDomainMin: 0, //min of latitude bar chart axis
      latitudeDomainMax: 90, //max of latitude bar chart axis
      latitudeDomainResolution: 2.5,
      altitudeDomainMin: 0, //min of altitude bar chart axis
      altitudeDomainMax: 5000, //max of altitude bar chart axis
      abundanceDomainMin: 0, //min of abundance axis
      abundanceDomainMax: 100,//max of abundance axis
      timeDomainMin: -22000, //min of time bar chart axis
      timeDomainMax: 100, //max of time bar chart axis
      colorYoung: "blue", //color to represent earliest dates on bubble chart
      colorOld:'red', //color to represent oldest dates on bubble chart
      timeBinSize: 1, //how big are the time bins in the analytics charts? --> years
      latitudeBinSize: 0.5, //how big are the latitude bins in the analytics charts? --> degrees
      abundanceBinSize: 1,//how big are the abundance bins in the analytics charts? --> TODO: this gets weird with mammal/pollen percent.
      altitudeBinSize: 500 //altitude bins --> meters
    },
    //default colors of interface elements
    colors : {
      tempCurve: 'red', //
      tempAgeHist: 'none', //histogram below the tempCurve (invisible)
      annotations: '#9A9C9E' //color of annotations on the temp curve
    },
    doAnnotations: true, //should annotations about time periods be put into the tempCurve?
    baseURL : "iam.html", //where does the *map* reside? e.g., what is this page?
    validationRules: {
      authorRequired: false,
      titleRequired: true,
      descriptionRequired: true,
      organizationRequired: false
    },
    walkthrough: {
      loadClean: false,
      defaultTaxonName: "sequoia",
      doWalkthrough: true //for post-hoc analysis only
    },
    timer: {
      sessionStart : null,
      sessionEnd : null,
      dataLoad : null,
      totalElapsed :null,
      loadElapsed : null
    }
  }
})(); //end configuration

module.exports =  config;
