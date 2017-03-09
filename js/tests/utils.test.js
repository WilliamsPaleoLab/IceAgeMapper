var utils = require("./../modules/processes/utils.js");
// var d3 = require('d3');
describe("taxon name validator", function(){
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

describe("taxon id validator", function(){
  it("should reject null inputs", function(){
    var check = utils.isValidTaxonID(null)
    expect(check).toBe(false);
  })
  it("should reject undefined inputs", function(){
    var check = utils.isValidTaxonID(undefined)
    expect(check).toBe(false);
  })
  it("should reject blank inputs", function(){
    var check = utils.isValidTaxonID("")
    expect(check).toBe(false);
  })
  it("should not accept strings", function(){
    var check = utils.isValidTaxonID("this is my taxon")
    expect(check).toBe(false);
  })
  it("should accept numbers", function(){
    var check = utils.isValidTaxonID(17)
    expect(check).toBe(true);
  })
  it("should not accept negative numbers", function(){
    var check = utils.isValidTaxonID(-17)
    expect(check).toBe(false);
  })
})

describe("URL parameter getting", function(){
  it("should return value of parameter", function(){
    var check = utils.getParameterByName("taxonname", "http://paleo.geography.wisc.edu/iam?taxonname=sedum");
    expect(check).toBe('sedum');
  })
  it("should be undefined if parameter is not there", function(){
    var check = utils.getParameterByName("taxonname", "http://paleo.geography.wisc.edu/iam")
    expect(check).toBe(null);
  })
  it("should handle multiple parameters in one call", function(){
    var check = utils.getParameterByName("otherParameter", "http://paleo.geography.wisc.edu/iam?taxonname=sedum&otherParameter=myParameterValue")
    expect(check).toBe('myParameterValue')
  })
})

describe("token validator", function(){
  it("should be a string", function(){
    var check = utils.isValidToken(112)
    expect(check).toBe(false)
  })
  it("should reject undefined inputs", function(){
    var check = utils.isValidToken(undefined)
    expect(check).toBe(false)
  })
  it("should reject null inputs", function(){
    var check = utils.isValidToken(null)
    expect(check).toBe(false)
  })
  it("should be nine characters long", function(){
    var check = utils.isValidToken("aaabbbccc")
    expect(check).toBe(true)
  })
})

describe("Map metadata validator", function(){
  it("should return an object with two keys", function(){
    var metadata = {
      author: "scott",
      organization: "UWM",
      title: "mapTitle",
      description: "mapDescription"
    }
    var check = utils.validateShareMapMetadata(metadata)
    expect(check.valid).toBeDefined();
    expect(check.failed).toBeDefined();
  })
  it("should fail when missing the map author", function(){
    var metadata = {
      organization: "UWM",
      mapTitle: "mapTitle",
      mapDescription: "mapDescription"
    }
    var check = utils.validateShareMapMetadata(metadata)
    expect(check.valid).toBeDefined();
    expect(check.valid).toBe(false);
    expect(check.failed).toEqual(['Author']);
  })
  it("should fail when missing the map description", function(){
    var metadata = {
      organization: "UWM",
      mapTitle: "mapTitle",
      author: "Author"
    }
    var check = utils.validateShareMapMetadata(metadata)
    expect(check.valid).toBeDefined();
    expect(check.valid).toBe(false);
    expect(check.failed).toEqual(['Description']);
  })
  it("should fail when missing the map organization", function(){
    var metadata = {
      author: "Author",
      mapTitle: "mapTitle",
      mapDescription: "mapDescription"
    }
    var check = utils.validateShareMapMetadata(metadata)
    expect(check.valid).toBeDefined();
    expect(check.valid).toBe(false);
    expect(check.failed).toEqual(['Organization']);
  })
  it("should fail when missing the map title", function(){
    var metadata = {
      organization: "UWM",
      author: "mapAuthor",
      mapDescription: "mapDescription"
    }
    var check = utils.validateShareMapMetadata(metadata)
    expect(check.valid).toBeDefined();
    expect(check.valid).toBe(false);
    expect(check.failed).toEqual(['Title']);
  })
  it("should pass when all attributes are passed", function(){
    var metadata = {
      organization: "UWM",
      author: "mapAuthor",
      mapDescription: "mapDescription",
      mapTitle: "Title"
    }
    var check = utils.validateShareMapMetadata(metadata)
    expect(check.valid).toBeDefined();
    expect(check.valid).toBe(true);
    expect(check.failed).toEqual([]);
  })
})


describe("share link validator", function(){
  it("should return a nonempty string", function(){
    var metadata = {
      organization: "UWM",
      author: "mapAuthor",
      mapDescription: "mapDescription",
      mapTitle: "Title"
    }
    var check = utils.createShareLink(metadata, "http://paleo.geography.wisc.edu")
    expect(check).not.toEqual("");
  })
})

describe("the window", function(){
  it("should be defined", function(){
    expect(window).toBeDefined();
  })
})
