var assert = require('assert');
var jasmine = require("jasmine")

describe('ice age mapper page', function() {
    it('should have a title', function () {
        browser.url('http://scottsfarley.com/IceAgeMapper');
        var title = browser.getTitle();
        assert.equal(title, 'Ice Age Mapper');
    });

    it('should accept taxonname as a command line argument', function(){
      browser.url('http://scottsfarley.com/IceAgeMapper/taxonname=Sequoia');
      browser.execute(function() {
          return window.config;
      }).then(function(config) {
          console.log(config.property);
      });
    })
});
