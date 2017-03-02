
var map = {
  updateSize = function(){
    //re-render the map when panel size changes
    if (this.map != undefined){
      this.map.resize();
    }else{
      this.map.on('load', function(){
          this.map.resize();
      })
    }
  }
}
