Feature('Landing Page');

Scenario('Title', (I) => {
  I.amOnPage('/index.html');
  I.seeInTitle('Ice Age Mapper'); //check that the main title is there
});

Scenario('Check main navigation on landing page', (I) => {
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
