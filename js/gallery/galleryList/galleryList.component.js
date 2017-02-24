// Register `phoneList` component, along with its associated controller and template
angular.
  module('galleryList').
  component('galleryList', {
    templateUrl:"js/gallery/galleryList/galleryList.template.html",
    controller: ['$http', function galleryController($http) {
      var self = this;
      self.orderProp = 'dateFormat'; //order by date

      $http.get('http://grad.geography.wisc.edu:8080/mapConfigs?summaryOnly=true').then(function(response) {
        responseData = response.data
        if (responseData.success){
          dat = responseData.data;
          dat.forEach(function(d){
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
            d.date = Date.parse(d.created_at)
            d.dateOrder = -1 * d.date //make negative so they're ordered right;
            d.dateFormat = new Date(d.date)
            d.dateFormat = d.dateFormat.toDateString();
            d.link = "iam.html?shareToken=" + d.hash
          })

          self.items = dat//this isn't recognized in this scope, so use self

          self.orderProp = "dateOrder";
        }else{
          self.items = []
        }

      });
    }]
  });
