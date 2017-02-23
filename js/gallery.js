var galleryApp = angular.module("galleryApp", []);

// Define the `PhoneListController` controller on the `phonecatApp` module
galleryApp.controller('galleryController', function galleryController($scope) {
$scope.phones = [
  {
    title: 'Nexus S',
    date: new Date().toLocaleString()
  }, {
    title: 'Motorola XOOM™ with Wi-Fi',
    date: new Date().toLocaleString()
  }, {
    title: 'MOTOROLA XOOM™',
    date: new Date().toLocaleString()
  }
];
});
