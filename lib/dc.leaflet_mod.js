
(function() { function _dc_leaflet(dc) {
    'use strict';

    var dc_leaflet = {
        version: '0.3.2'
    };

    dc_leaflet.leafletBase = function(_chart) {
        _chart = dc.marginMixin(dc.baseChart(_chart)); //_chart inherits from dc

        _chart.margins({left:0, top:0, right:0, bottom:0});

        var _map;

        var _mapOptions=globals.config.mapOptions;
        var _defaultCenter=false;
        var _defaultZoom=false;

        var _cachedHandlers = {};

        var _createLeaflet = function(root) {
          //create the leaflet map in a div appended to the chart root

            // append sub-div if not there, to allow client to put stuff (reset link etc.)
            // in main div. might also use relative positioning here, for now assume
            // appending will put in right position
            var child_div = root.selectAll('div.dc-leaflet')
                    .data([0]).enter()
                  .append('div').attr('class', 'dc-leaflet')
                    .style('width', _chart.effectiveWidth() + "px")
                    .style('height', _chart.effectiveHeight() + "px");
            var map = L.map(child_div.node(),_mapOptions);
            globals.map = map;
            return map;
        };

        var _tiles=function(map) {
          //create a tile layer and add it to the map
            L.tileLayer(globals.config.map.primaryTileURL, {
                attribution: globals.config.map.attribution
            }).addTo(map);
        };

        _chart.createLeaflet = function(_) {
            if(!arguments.length) {
                return _createLeaflet;
            }
            _createLeaflet = _;
            return _chart;
        };

        _chart._doRender = function() {
            if(! _chart.map()){
                _map = _createLeaflet(_chart.root());
                for(var ev in _cachedHandlers)
                    _map.on(ev, _cachedHandlers[ev]);

                if (_defaultCenter && _defaultZoom) {
                    _map.setView(_chart.toLocArray(_defaultCenter), _defaultZoom);
                }

                _chart.tiles()(_map); //add tiles
                _chart._postRender();
            }
            else
                console.warn("WARNING: Leaflet map already rendered.");

            return _chart._doRedraw(); //re-draw all charts after map has been completed
        };

        _chart._doRedraw = function() {
            return _chart;
        };

        _chart._postRender = function() {
            return _chart;
        };

        _chart.mapOptions = function(_) {
            if (!arguments.length) {
                return _mapOptions;
            }
            _mapOptions = _;
            return _chart;
        };

        _chart.center = function(_) {
            if (!arguments.length) {
                return _defaultCenter;
            }
            _defaultCenter = _;
            return _chart;
        };

        _chart.zoom = function(_) {
            if (!arguments.length) {
                return _defaultZoom;
            }
            _defaultZoom = _;
            return _chart;
        };

        _chart.tiles = function(_) {
            if (!arguments.length) {
                return _tiles;
            }
            _tiles = _;
            return _chart;
        };

        _chart.map = function() {
            return _map;
        };

        _chart.toLocArray = function(value) {
            if (typeof value === "string") {
                // expects '11.111,1.111'
                value = value.split(",");
            }
            // else expects [11.111,1.111] --> array
            return value;
        };

        // combine Leaflet events into d3 & dc events
        dc.override(_chart, 'on', function(event, callback) {
            var leaflet_events = ['zoomend', 'moveend'];
            if(leaflet_events.indexOf(event) >= 0) {
                if(_map) {
                    _map.on(event, callback);
                }
                else {
                    _cachedHandlers[event] = callback;
                }
                return this;
            }
            else return _chart._on(event, callback);
        });

        return _chart;
    };

    dc_leaflet.markerChart = function(parent, chartGroup) {
        var _chart = dc_leaflet.leafletBase({});

        var _renderPopup = true;
        var _cluster = false; // requires leaflet.markerCluster
        var _clusterOptions=false;
        var _rebuildMarkers = false;
        var _brushOn = true;
        var _filterByArea = true;

        var _filter;
        var _innerFilter=false;
        var _zooming=false;
        var _layerGroup = false;
        var _markerList = [];
        var _currentGroups=false;

        _chart.renderTitle(true);

        var _location = function(d) {
          //get location of marker
          //grouping is by L.latLng object
            return _chart.keyAccessor()(d);
        };

        var _marker = function(d,map) {
            var marker = new L.CircleMarker(_chart.toLocArray(_chart.locationAccessor()(d)), 10,{
                title: _chart.renderTitle() ? _chart.title()(d) : '',
                alt: _chart.renderTitle() ? _chart.title()(d) : '',
                icon: _icon(),
                clickable: _chart.renderPopup() || (_chart.brushOn() && !_filterByArea),
                draggable: false
            });
            return marker;
        };

        var _icon = function(d,map) {
            return new L.Icon.Default();
        };

        var _popup = function(d,marker) {
            return _chart.title()(d);
        };

        _chart._postRender = function() {
            if (_chart.brushOn()) {
                if (_filterByArea) {
                    _chart.filterHandler(doFilterByArea);
                }

                _chart.map().on('zoomend moveend', zoomFilter, this );
                if (!_filterByArea)
                    _chart.map().on('click', zoomFilter, this );
                _chart.map().on('zoomstart', zoomStart, this);
            }

            if (_cluster) {
                _layerGroup = new L.MarkerClusterGroup(_clusterOptions?_clusterOptions:null);
            }
            else {
                _layerGroup = new L.LayerGroup();
            }
            _chart.map().addLayer(_layerGroup);
        };

        _chart._doRedraw = function() {
            var groups = _chart._computeOrderedGroups(_chart.data()).filter(function (d) {
                return _chart.valueAccessor()(d) !== 0;
            });
            if (_currentGroups && _currentGroups.toString() === groups.toString()) {
                return;
            }
            _currentGroups=groups;

            if (_rebuildMarkers) {
                _markerList=[];
            }
            _layerGroup.clearLayers();

            var addList=[];
            groups.forEach(function(v,i) {
                var key = _chart.keyAccessor()(v);
                var marker = null;
                if (!_rebuildMarkers && key in _markerList) {
                    marker = _markerList[key];
                }
                else {
                    marker = createmarker(v,key);
                }
                if (!_chart.cluster()) {
                    _layerGroup.addLayer(marker);
                }
                else {
                    addList.push(marker);
                }
            });

            if (_chart.cluster() && addList.length > 0) {
                _layerGroup.addLayers(addList);
            }
        };

        _chart.locationAccessor = function(_) {
            if (!arguments.length) {
                return _location;
            }
            _location= _;
            return _chart;
        };

        _chart.marker = function(_) {
            if (!arguments.length) {
                return _marker;
            }
            _marker= _;
            return _chart;
        };

        _chart.icon = function(_) {
            if (!arguments.length) {
                return _icon;
            }
            _icon= _;
            return _chart;
        };

        _chart.popup = function(_) {
            if (!arguments.length) {
                return _popup;
            }
            _popup= _;
            return _chart;
        };

        _chart.renderPopup = function(_) {
            if (!arguments.length) {
                return _renderPopup;
            }
            _renderPopup = _;
            return _chart;
        };


        _chart.cluster = function(_) {
            if (!arguments.length) {
                return _cluster;
            }
            _cluster = _;
            return _chart;
        };

        _chart.clusterOptions = function(_) {
            if (!arguments.length) {
                return _clusterOptions;
            }
            _clusterOptions = _;
            return _chart;
        };

        _chart.rebuildMarkers = function(_) {
            if (!arguments.length) {
                return _rebuildMarkers;
            }
            _rebuildMarkers = _;
            return _chart;
        };

        _chart.brushOn = function(_) {
            if (!arguments.length) {
                return _brushOn;
            }
            _brushOn = _;
            return _chart;
        };

        _chart.filterByArea = function(_) {
            if (!arguments.length) {
                return _filterByArea;
            }
            _filterByArea = _;
            return _chart;
        };

        _chart.markerGroup = function() {
            return _layerGroup;
        };

        var createmarker = function(v,k) {
            var marker = _marker(v);
            marker.key = k;
            if (_chart.renderPopup()) {
                marker.bindPopup(_chart.popup()(v,marker));
            }
            if (_chart.brushOn() && !_filterByArea) {
                marker.on("click",selectFilter);
            }
            _markerList[k]=marker;
            return marker;
        };

        var zoomStart = function(e) {
            _zooming=true;
        };

        var zoomFilter = function(e) {
            if (e.type === "moveend" && (_zooming || e.hard)) {
                return;
            }
            _zooming=false;

            if (_filterByArea) {
                var filter;
                if (_chart.map().getCenter().equals(_chart.center()) && _chart.map().getZoom() === _chart.zoom()) {
                    filter = null;
                }
                else {
                    filter = _chart.map().getBounds();
                }
                dc.events.trigger(function () {
                    _chart.filter(null);
                    if (filter) {
                        _innerFilter=true;
                        _chart.filter(filter);
                        _innerFilter=false;
                    }
                    dc.redrawAll(_chart.chartGroup());
                });
            } else if (_chart.filter() && (e.type === "click" ||
                                           (_markerList.indexOf(_chart.filter()) !== -1 &&
                                            !_chart.map().getBounds().contains(_markerList[_chart.filter()].getLatLng())))) {
                dc.events.trigger(function () {
                    _chart.filter(null);
                    if (_renderPopup) {
                        _chart.map().closePopup();
                    }
                    dc.redrawAll(_chart.chartGroup());
                });
            }
        };

        var doFilterByArea = function(dimension, filters) {
            _chart.dimension().filter(null);
            if (filters && filters.length>0) {
                _chart.dimension().filterFunction(function(d) {
                    if (!(d in _markerList)) {
                        return false;
                    }
                    var locO = _markerList[d].getLatLng();
                    return locO && filters[0].contains(locO);
                });
                if (!_innerFilter && _chart.map().getBounds().toString !== filters[0].toString()) {
                    _chart.map().fitBounds(filters[0]);
                }
            }
        };

        var selectFilter = function(e) {
            if (!e.target) return;
            var filter = e.target.key;
            dc.events.trigger(function () {
                _chart.filter(filter);
                dc.redrawAll(_chart.chartGroup());
            });
        };

        return _chart.anchor(parent, chartGroup);
    };

  dc_leaflet.d3 = d3;
  dc_leaflet.crossfilter = crossfilter;
  dc_leaflet.dc = dc;

  return dc_leaflet;
  }


  if (typeof define === 'function' && define.amd) {
      define(["dc"], _dc_leaflet);
  } else if (typeof module == "object" && module.exports) {
      var _dc = require('dc');
      module.exports = _dc_leaflet(_dc);
  } else {
      this.dc_leaflet = _dc_leaflet(dc);
  }
}
)();
