
Feature('Gallery');

Before((I) => { // or Background
  I.amOnPage('/gallery.html');
});

Scenario('Check controls', (I) => {
  I.seeElement("input.form-control")
  I.seeElement("select.form-control")
  I.see("Menu")
});

Scenario('Check Navigation Exists', (I) =>{
  I.click("Menu")
  I.seeElement("ul.dropdown-menu")
  I.see("Home")
  I.see("Gallery")
  I.see("Documentation")
  I.see("Interactive Taxonomy")
})

Scenario('Check Nav to Home', (I)=>{
  I.click("Menu")
  I.seeElement("ul.dropdown-menu")
  I.see("Home");
  I.click("Home");
  I.seeInCurrentUrl("/index.html")
})

Scenario('Check Nav to Docs', (I)=>{
  I.click("Menu")
  I.seeElement("ul.dropdown-menu")
  I.see("Documentation")
  I.click("Documentation")
  I.seeInCurrentUrl("docs.html")
})

Scenario('Check Nav to Taxonomy', (I)=>{
  I.click("Menu")
  I.seeElement("ul.dropdown-menu")
  I.see("Interactive Taxonomy")
  I.click("Interactive Taxonomy")
  I.seeInCurrentUrl("taxonomy.html")
})

Scenario('Check Nav to Self', (I)=>{
  I.click("Menu")
  I.click("Gallery")
  I.seeInCurrentUrl("gallery.html")
})

Scenario('Check dropdown', (I) => {
  I.seeElement("select.form-control")
  I.click("select.form-control")
  I.see("Newest")
  I.see("Title")
  I.see("Organization")
});

Scenario('Check gallery items', (I) => {
  I.click(".gallery-item")
  I.seeInCurrentUrl("iam.html?shareToken=")
});
