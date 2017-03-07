Feature('Landing Page');

Scenario('Title', (I) => {
  I.amOnPage('/index.html');
  I.seeInTitle('Ice Age Mapper'); //check that the main title is there
});

Scenario('Check navigation to main map', (I) => {
  I.amOnPage('/index.html');
  I.seeElement("#goToMap"); //make sure the link is present
  I.click("Take me straight to the map");//click the link
  I.seeInCurrentUrl("/iam.html") //make sure the navigation works
});

Scenario('Check search bar', function*(I){
  I.amOnPage('/index.html');
  I.seeElement("#taxaAutocomplete");
  I.fillField("#taxaAutocomplete", "picea");
  //check that it autocompletes
  I.seeElement('li', {'text': "Picea"})
  I.seeElement('li', {'text': "Picea sp."})
  I.seeElement('li', {'text': "Picea abies"})

  //click the first element
  I.click("ul>li>mark");
  //check the link is right
  I.click("#searchButton");
  I.seeInCurrentUrl("/iam.html?taxonname=Picea")
});

Scenario('Check Navigation to Gallery', (I)=>{
  I.amOnPage("/index.html");
  I.seeElement("#goToGallery");
  I.click("#goToGallery");
  I.seeInCurrentUrl("/gallery.html")
})

Scenario('Check Navigation to Taxonomy', (I)=>{
  I.amOnPage("/index.html");
  I.seeElement("#goToTaxonomy");
  I.click("#goToTaxonomy");
  I.seeInCurrentUrl("/taxonomy.html")
})

Scenario('Check Social Links', (I)=>{
  I.amOnPage("/index.html");
  I.seeElement("ul.banner-social-buttons");
  I.click("ul.banner-social-buttons>li:nth-child(1)");
  I.seeInCurrentUrl("twitter.com")
  I.amOnPage("/index.html");
  I.click("ul.banner-social-buttons>li:nth-child(2)");
  I.seeInCurrentUrl("github.com")
  I.amOnPage("/index.html");
  I.click("ul.banner-social-buttons>li:nth-child(3)");
  I.seeInCurrentUrl("github.io")
})

Scenario('Check Ecological Group Dropdown', (I)=>{
  I.amOnPage("/index.html");
  I.seeElement("select#ecolGroupSelect");
  I.click("select#ecolGroupSelect")
  I.see("Aves");
  I.selectOption("select#ecolGroupSelect", "Aves")
  I.click("select#taxonSelect")
  I.see("cf. Aves")
  I.see("Aves sp.")
  I.see("Aves spp.")
  I.selectOption("select#taxonSelect", "Aves spp.")
  I.click("#selectButton")
  I.seeInCurrentUrl("?taxonid=19648")
})
