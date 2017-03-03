//this holds all relevant info to be shared and saved.
//variables go in here if they might be modified by the user during a session
var state  =  (function(){
  return {
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
  }
})();//end state
