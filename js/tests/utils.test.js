var utils = require("./../modules/processes/utils.js");
// var d3 = require('d3');
describe("taxon name checking function", function(){
  it("should reject null inputs", function(){
    var check = utils.isValidTaxonName(null)
    expect(check).toBe(false);
  })
  it("should reject undefined inputs", function(){
    var check = utils.isValidTaxonName(undefined)
    expect(check).toBe(false);
  })
  it("should reject blank inputs", function(){
    var check = utils.isValidTaxonName("")
    expect(check).toBe(false);
  })
  it("should accept strings", function(){
    var check = utils.isValidTaxonName("this is my taxon")
    expect(check).toBe(true);
  })
})
