//this file holds functions related to filtering the ice sheets

var _ = require("underscore");

var icesheets = (function() {
    ages = []

    function getIceAges() {
        $.getJSON("./../../../data/icesheets.json", function(data) {
                for (var i = 0; i < data.features.length; i++) {
                    ages.push(+data.features[i].properties.Age);
                }
                return ages
            }) //end ajax

    } //end functuon

    function init() {
        getIceAges();
    }

    function filterFromRange(ageRange) {
        //filter to max extent of age range
        //get closest to max of input
        maxAge = ageRange[0]
        if (maxAge > -3000) {
            closestAge = 1
        } else {
            closestAge = ages.closest(minAge);
        }
        applyFilter(closestAge)
    }

    function applyFilter(age) {
        //put a filter on the map icesheet layer
        //TODO: this doesn't work
        if (window.map.loaded()) {
            window.map.setFilter('icesheets', ['==', 'Age', age]);
            return
        } else {
            window.map.on('load', function() {
                window.map.setFilter('icesheets', ['==', 'Age', age]);
                return
            })
        }
    }

    return {
        init: init,
        ages: ages,
        filter: applyFilter,
        filterFromRange: filterFromRange
    }
})();

module.exports = icesheets;
