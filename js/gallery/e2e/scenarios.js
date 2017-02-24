describe('Gallery Page', function() {

  describe('galleryApp', function() {

    beforeEach(function() {
      browser.get('index.html');
    });

    it('should filter the list as a user types into the search box', function() {
      var list = element.all(by.repeater('item in $ctrl.items'));
      var query = element(by.model('$ctrl.query'));

      expect(list.count()).toBe(3);

      query.sendKeys('nexus');
      expect(list.count()).toBe(1);

      query.clear();
      query.sendKeys('motorola');
      expect(list.count()).toBe(2);
    });

  });

});
