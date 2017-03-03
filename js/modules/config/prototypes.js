//direct modification to native javascript primitives
var prototypes = (function(){
  var closest =  function  (num) {
    arr = this
    var curr = arr[0];
    var diff = Math.abs (num - curr);
    for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs (num - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
        }
    }
    return curr;
  }

  var applyClosestPrototype = function(){
    Array.prototype.closest = closest;
  }

  var enableAllPrototypes = function(){
    applyClosestPrototype();
  }

  return {
    enableAllPrototypes: enableAllPrototypes
  }

})();


module.exports = prototypes
