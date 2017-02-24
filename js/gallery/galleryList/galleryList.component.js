// Register `phoneList` component, along with its associated controller and template
angular.
  module('galleryList').
  component('galleryList', {
    templateUrl:"js/gallery/galleryList/galleryList.template.html",
    controller: ['$http', function galleryController($http) {
      var self = this;
      self.orderProp = 'created_at'; //order by date

      $http.get('http://grad.geography.wisc.edu:8080/mapConfigs?summaryOnly=true').then(function(response) {
        responseData = response.data
        if (responseData.success){
          self.items = responseData.data; //this isn't recognized in this scope, so use self
          self.items.forEach(function(d){
            if(d.description == null){
              d.description = "No description."
            }
            if (d.title == null){
              d.title = "Untitled Map"
            }
            if (d.organization == null){
              d.organization = ""
            }
            if (d.author == null){
              d.author = ""
            }
            d.dateFormat = new Date(d.created_at)
            d.dateFormat = d.dateFormat.toDateString();
          })
        }else{
          self.items = []
        }

      });
    }]
  });
