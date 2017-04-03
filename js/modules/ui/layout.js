var layout = (function(){
  var create = function(config, state){
    this.layout = $('body').layout({
      south: {
        size: config.layout.southPanelSize,
        resizable: config.layout.southPanelResizable,
        initClosed: !state.layout.southPanelIsOpen,
        closable: config.layout.southPanelClosable,
        onresize: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize()
        },
        onclose: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize()
          window.state.layout.southPanelIsOpen = false
        },
        onopen: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize()
          window.state.layout.southPanelIsOpen = true
        },
        togglerLength_open:    '100%',
        togglerLength_closed:  '100%',
        togglerContent_open:  "<button class='toggleButton toggleButtonClose'>Close</button>",
        togglerContent_closed: "<button class='toggleButton btn'>Timeline <i class='fa fa-arrow-up' aria-hidden='true'></i></button>"
      },
      west: {
        size: config.layout.westPanelSize,
        resizable: config.layout.westPanelResizable,
        initClosed: !state.layout.westPanelIsOpen,
        closable: config.layout.westPanelClosable,
        onresize: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize()
        },
        onclose: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize()
          window.state.layout.westPanelIsOpen = false
          window.state.openSite = false;
        },
        onopen: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize()
          window.state.layout.westPanelIsOpen = true
        },
        togglerLength_open:    '100%',
        togglerLength_closed:  '100%',
        togglerContent_open:  "<button class='toggleButton toggleButtonClose rotate-neg btn'>Close </button>",
        togglerContent_closed: "<button class='toggleButton rotate btn'><span class='rotate'>Site</span><i class='fa fa-arrow-up' aria-hidden='true'></i></button>"
      },
      east: {
        size: config.layout.eastPanelSize,
        resizable: config.layout.eastPanelResizable,
        initClosed: !state.layout.eastPanelIsOpen,
        closable: config.layout.eastPanelClosable,
        onresize: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize()
        },
        onclose: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize();
          window.state.layout.eastPanelIsOpen = false
        },
        onopen: function(){
          var UIEvents = require('./events.js');
          UIEvents.updateMapSize();
          window.state.layout.eastPanelIsOpen = true
        },
        togglerLength_open:    '50%',
        togglerLength_closed:  '50%',
        togglerContent_open:  "<button class='toggleButton toggleButtonClose rotate btn rotate-neg'>Close Dashboard</button>",
        togglerContent_closed: "<button class='toggleButton rotate btn'><span class='rotate'>Dashboard</span> <i class='fa fa-arrow-down' aria-hidden='true'></i></button>"
      }
    });
    return this.layout
  }
  return {
    create: create,
    layout: this.layout
  }
})();

module.exports = layout;
