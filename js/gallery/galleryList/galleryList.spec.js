describe('galleryList', function() {

  // Load the module that contains the `phoneList` component before each test
  beforeEach(module('galleryList'));

  // Test the controller
  describe('galleryController', function() {

    it('should create a `galleryItem` model with 3 items', inject(function($componentController) {
      var ctrl = $componentController('galleryList');

      expect(ctrl.items.length).toBe(3);
    }));

  });

});
