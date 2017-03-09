var dc = require('dc');

var dataTable = (function(){
  var taxaTable = function(dimension, height, width){
    if(height === undefined){
      height = 100
    }
    if(width === undefined){
      width = 150;
    }

    return dc.dataTable("#data-table")
    .height(100)
    .width(150)
    .dimension(dimension)
    .group(function(d){return ""})
    .size(2)
    .columns([function (d) {
      return d.Taxon }, function (d) { return d.Count}])

  }

  var create = function(group){
    var dimension = generateDimension(group)
    var chart = new taxaTable(dimension)
    return chart
  }

  var generateDimension = function(group){
      var dimension = {
      top: function (x) {
        return group.all(x)
                .map(function (grp) { return {"Taxon":grp.key, "Count":grp.value}; });
        },
        bottom: function (x) {
          return group.all()
                  .map(function (grp) { return {"Taxon":grp.key, "Count":grp.value}; });
          }
    }
    return dimension
  }

  return {
    create: create
  }

})();

module.exports = dataTable;
