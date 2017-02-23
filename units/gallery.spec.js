describe('galleryController', function() {

  beforeEach(module('galleryApp'));

  it('should create a `galleryItem` model with 3 items', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('galleryController', {$scope: scope});

    expect(scope.phones.length).toBe(3);
  }));

});
