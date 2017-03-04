var initializeUI = (function(){
  //initialize with configuration
    ui.layout = layout.create(config, state);
    ui.mapChart = map.create();
    ui.map = ui.mapChart.map();
})
