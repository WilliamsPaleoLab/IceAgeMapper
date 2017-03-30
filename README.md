# Ice Age Mapper
An interactive geovisualization application for communicating climate-driven paleoecological change since the last glacial maximum for both students and researchers.

Developed at University of Wisconsin, Madison, Dept. of Geography.  

### Live Versions
1.  ```Alpha``` [http://scottsfarley93.github.io/IceAgeMapper](http://scottsfarley.com/IceAgeMapper) -- unstable, bleeding edge version featuring the latest commit. If this doesn't work, try the beta version.
2.  ```Beta``` [http://paleo.geography.wisc.edu](http://paleo.geography.wisc.edu) -- the latest stable release of the software: might not have all the latest features, but shouldn't fail miserably.

### Purpose
Paleoecological databases offer our primary information about the spatial responses of species and communities to large
climatic changes. However, the spatiotemporal characteristics and high dimensionality of paleoecological
datasets create significant challenges for its effective visualization. Given recent rapid advances in interactive cartography, dynamic mapping, and data visualization, there are opportunities to develop new forms of visualizations that effectively communicate ecological trends through space, time, and attribute. New geovisualizations can lead to new
insights by scientists and the general public. The Neotoma Paleoecological Database contains data on fossil mammals,
plants, and marine and freshwater organisms over the last 2.5 million years, tracking floral and faunal community change
over major shifts in the earth’s climate, and, more recently, shifts in response to anthropogenic change. The work presented here applies the principles of interactive cartography and geographic visualization to develop a platform for communicating the spatial and temporal aspects of species distribution shifts, in both geographic and environmental space. The tool enables users to explore Neotoma’s collections to delineate and identify interesting clusters and trends. Contextual layers, including late Pleistocene ice sheets and paleoclimatic visualizations, are included to improve the user’s comprehension of landscape- to continental-scale changes. The system runs on an Open Web standard
technology stack of free and open source tools, which promotes community
involvement and development. A primary audience for IceAgeMapper is undergraduate
university students, and its development is accompanied by a laboratory exercise that
guides its inclusion into a classroom setting.

### Development Notes
- Mobile devices are likely to struggle with rendering the IAM interface. Mobile development has not yet been a primary development target. The dashboard components are not designed for small-screen browsing and there is a lot of data communicated across the network. If you'd like to help me develop on mobile -- let me know!
- Most development has been done on Google Chrome, and other browsers might be unhappy with some of the features.  Internet Explorer is particularly unlikely to successfully run IceAgeMapper.


### Libraries, Data, and Tech
#### Open Source Libraries
- **jQuery** ```v2```: DOM manipulation.
- **Bootstrap** ```v3```: Layout and UI bells and whistles like tooltips and modal dialogs.
- **Underscore** ```v1```: Array and object manipulation.  The neotoma data comes in as array of large objects, so efficiently parsing and filtering these is important.
- **D3.js** ```v3```: SVG drawing (dependency).
- **Mapboxgl** ```1.0.0```: Vector tile slippy mapping (dependency).
- **Crossfilter** ```1.0.0```: Efficient multidimensional filtering of arrays.
- **dc.js** ```1.0.0```: Efficient visualization of crossfilter datasets (d3/crossfilter mashup). The creator of most of the dashboard components in the IAM interface.
- **Awesomeplete** : Populating the autocomplete search box with taxa names.
- **dc-mapbox** : Efficient rendering of geographically explicit points in a crossfilter array on a mapbox-gl vector tile map.


#### Data Sources
- **Paleoecological Data**: The fossil occurrences and abundances come from the [Neotoma Database](http://neotomadb.org) using their [API](http://api.neotomadb.org).

#### Technology
The development version of the application is hosted by Github, using the Github pages feature.

The stable version is hosted by the University of Wisconsin, Madison, using a Windows-based server provided by the Department of Geography/Paleovegetation Lab.


### Release History
- ```v2.1.0 Alpha``` Ground-up redevelopment (forthcoming).

  * New flat-design layout
  * Dashboard filtering
  * Vector tile map using mapboxgl
  * New landing page
  * Savable map configurations saved in a dedicated database table
  * Gallery for browsing saved map configs with metadata.

- ```v1.0.2 Alpha```  Features release (Nov 11, 2016).

  * Macrostrat Geology Layer
  * Hexagonal Binning
  * Improved performance using compressed responses from Neotoma
  * Time bar improvements
  * Bug Fixes

- ```v1.0.1 Beta```  Stable release (Aug 30, 2016).

  * GPU/WebGL heatmap improves performance
  * Exact temporal window sizing
  * Temporal window jump
  * Shareable URLs that reflect current application state
  * Advanced settings for customizing app parameters
  * Usability Improvements
  * Bug Fixes

- ```v1.0.0 Alpha``` Pre-AMQUA release to the shc server.  
  * Initial Release.

### Development Roadmap

✓ = Done
(version) = Will be completed in that version

Current Interface Version: 2.1 ✓

Upcoming versions:

*	2.2 (3/7)
*	2.3 (4/15)
*	2.4 (6/1)
*	3.0 (Not scheduled)
*	4.0 (Not scheduled)



#### Data

*	Get occurrence (SampleData) from NeotomaDB ✓
*	Get metadata (Datasets) from NeotomaDB  ✓
*	Get list of all taxa from NeotomaDB ✓
*	Get details about specific taxon from NeotomaDB ✓
*	Get ecological groups and their membership from NeotomaDB ✓
*	Load shared map from IAM server ✓
*	Save shared map to IAM server ✓
*	Get vector tileset & style definition from Mapbox.com ✓
*	Get spatiotemporal positions of paleoiceshets (2.2)
*	Get northern hemisphere temperature data ✓
*	Get contextual information/common name/picture of taxon (2.3)

#### Representations

*	Bubble chart representing species niche (altitude vs. latitude) ✓
*	Scatter plot of arbitrary environmental covariates (3.0)
*	Bar chart of altitude ✓
*	Bar chart of latitude ✓
*	Bar chart of longitude (?)
*	Bar chart of relative abundance (awaiting Neotoma API version upgrade)
*	Pie chart or stacked bar chart of principle investigator ✓
*	Pie chart or stacked bar chart of record types ✓
*	Temporally explicit layer cake (space-height) of paleo-icesheets (2.2)
*	Line graph of northern hemisphere mean temperature ✓
*	Site details (name, notes, investigator) ✓
*	Table of sample at a site (age, value) ✓
*	Number of total samples (under current filter) ✓
*	Gallery of pre-configured/pre-exported maps (title, author) ✓

#### Interactions

*	Pan the map ✓
*	Zoom the map ✓
*	Change the pitch of the map ✓
*	Change the bearing/view direction of the map ✓
*	Import saved map ✓
*	Export raw data as csv (2.3)
*	Export raw data as json (2.3)
*	Save the map configuration ✓
*	Sequence through time ✓
*	Overlay paleo-icesheets (2.2)
*	Filter by latitude ✓
*	Filter by longitude ✓
*	Filter by altitude ✓
*	Filter by relative abundance ✓
*	Filter by PI ✓
*	Filter by record type ✓
*	Filter by current map view ✓
*	Search for data on a specific taxon ✓
*	Browse for data on a specific taxon using its ecological group ✓
*	Browse for data on a specific taxon using its relative position in the taxonomic hierarchy ✓
*	Retrieve details about a site ✓
*	Retrieve details about the currently displayed taxon (2.3)
*	Reset all filters ✓
*	Animate through time (2.3)

#### Navigation

*	Open a blank map ✓
*	Open a map pre-loaded with data on a queried taxon name ✓
*	Open a map pre-loaded with data on a queried taxon id ✓
*	Import a pre-configured map (import interaction operator) ✓
*	Open/close site details panel ✓
*	Open/close analytics charts panel ✓
*	Open/close contextual temperature chart ✓
*	Resize site details panel ✓
*	Resize analytics chart panel ✓
*	Resize contextual temperature panel ✓
*	Open a gallery of pre-configured maps ✓
*	Open a taxonomic hierarchy ✓
*	Open a tutorial (2.4)
*	Open the documentation of the interface (2.4)

### Mobile

* Develop for mobile. (4.0)

### Contact

This project is part of Scott Farley's Master's Thesis at UW.  Please shoot me an email if you have any comments or suggestions, or wish to collaborate.
Contact: sfarley2@wisc.edu
