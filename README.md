# IceAgeMapper
Geovisualization application for data in the Neotoma Paleoecological Database, designed for hypothesis generation and exporation.  
Developed at University of Wisconsin, Madison Geography.  

### Live Versions
1.  ```Alpha``` [http://scottsfarley93.github.io/IceAgeMapper](http://scottsfarley93.github.io/IceAgeMapper) -- unstable, bleeding edge 
  version featuring the latest commit.
2.  ```Beta``` [http://paleo.geography.wisc.edu](http://paleo.geography.wisc.edu) -- the latest stable release of the software.

### Purpose
Paleoecological databases offer our primary information about the spatial responses of species and communities to large
climatic changes. However, the spatiotemporal characteristics and high dimensionality of paleoecological
datasets create significant challenges for its effective visualization. Given recent rapid advances in interactive cartography,
dynamic mapping, and data visualization, there are opportunities to develop new forms of visualizations that effectively
communicate ecological trends through space, time, and attribute. New geovisualizations can lead to new
insights by scientists and the general public. The Neotoma Paleoecological Database contains data on fossil mammals,
plants, and marine and freshwater organisms over the last 2.5 million years, tracking floral and faunal community change
over major shifts in the earth’s climate, and, more recently, shifts in response to anthropogenic change. The work presented
here applies the principles of interactive cartography and geographic visualization to develop a platform for communicating
the spatial and temporal aspects of species distribution shifts, in both geographic and environmental space. The
tool enables users to explore Neotoma’s collections to delineate and identify interesting clusters and trends. Contextual
layers, including late Pleistocene ice sheets and paleoclimatic visualizations, are included to improve the user’s comprehension
of landscape- to continental-scale changes. The system runs on an Open Web standard
technology stack of free and open source tools, which promotes community
involvement and development. A primary audience for IceAgeMapper is undergraduate
university students, and its development is accompanied by a laboratory exercise that
guides its inclusion into a classroom setting. 

### Features
- **Seamless Connection to the Neotoma Paleoecological Database**: Using Neotoma’s public Application Programming Interface (API), 
IceAgeMapper supports live
searching and browsing of the Neotoma Database’s collection.
- **Taxonomy Browser**: Details about taxonomic hierarchy is provided to help users draw connections between different
taxonomic groups
- **Site Locations and Metadata**: Each data record from Neotoma can be overlaid on the central map, showing the spatial
distribution of sites and includes details including geographic location, abundance, primary
investigators and their contact information, and site descriptions and field notes. 
- **Temporal Browsing**: To promote visualizing change through time, the application allows users to easily change the time
interval they are browsing by using a slider bar. The temporal window size can also be modified,
allowing investigation into specific points in time or over thousands of years. The time axis is
vertical, which will be familiar to users accustomed to interpreting traditional pollen diagrams.
- **Temporal Distribution**: All sites on the central map are also shown in a vertical column along the time axis, denoting the
taxon’s distribution through time, which may generate questions worthy of additional
exploration.
- **Late Pleistocene Ice Sheets Overlay** : IceAgeMapper provides an optional ice sheet overlay that communicates the changing extent of North American ice sheets during the last deglaciation.
- **Web-based**: The web-based tool is accessed through a traditional web browser like Google Chrome, Mozilla Firefox, or Apple Safari, allowing users with
any operating system, or even a mobile device, to access and use the tool. 
- **Free and Open Source**: The website is both built on open source software libraries, and is an open source project itself. Libraries such as Leaflet, jQuery, and d3.js
are strongly supported by the developer community and can be modified to fit a project’s needs. IceAgeMapper has a central repository here on
GitHub and we welcome anyone to make contributions to the project. 

### Development Notes
- Mobile devices may struggle with the large data payloads being transfered from remote servers during the application runtime.  Mobile device development has not yet been a primary target.  
- Most development has been done on Google Chrome, and other browsers might be unhappy with some of the features.  Internet Explorer is particularly unlikely to successfully run IceAgeMapper.


### Libraries, Data, and Tech
#### Open Source Libraries
- **jQuery** ```2.2.3```: DOM manipulation
- **Bootsrap** ``3.3.6```: Layout and UI bells and whistles like tooltips and modal dialogs.
- **Underscore** ```1.8.3```: Array and object manipulation.  The neotoma data comes in as array of large objects, so efficiently parsing and filtering these is important.
- **D3.js** ```v3```: SVG drawing.
- **Leaflet** ``1.0.0```: Slippy mapping with dynamic overlays.
- **Awesomeplete** : Populating the autocomplete search box with taxa names.
- **leaflet.Dialog**: Leaflet plugin for creating info windows on top of the map.
- **leaflet.Toolbar**: Leaflet plugin for creating a custom toolbar.
- **webgl-heatmap**: Foundation for heatmapping on a canvas using webgl/GPU.
- **webgl-heatmap-leaflet**: Leaflet pluging for using the webgl heatmap tool on the leaflet context.
- **URI.js**: URI manipulation for creating and parsing shareable URLs that reflect current application state.


#### Data Sources
- **Paleoecological Data**: The fossil occurrences and abudances come from the [Neotoma Database](http://neotomadb.org) using their [API](http://api.neotomadb.org). 
Some custom endpoints are used that run off of the Neotoma Development Server and were developed by the folks at Neotoma specifically for this application.
- **Ice Sheets**: Late Pleistocene Ice Sheets were digitized from [this paper](http://www.sciencedirect.com/science/article/pii/S0277379198000122). The geojson files are available for your use within the data folder of this repository. Citation:
<pre>
P.J Bartlein, K.H Anderson, P.M Anderson, M.E Edwards, C.J Mock, R.S Thompson, R.S Webb, T Webb III, C Whitlock, Paleoclimate simulations for North America over the past 21,000 years: features of the simulated climate and comparisons with paleoenvironmental data, Quaternary Science Reviews, Volume 17, Issues 6–7, 1 April 1998, Pages 549-585, ISSN 0277-3791, http://dx.doi.org/10.1016/S0277-3791(98)00012-2.
(http://www.sciencedirect.com/science/article/pii/S0277379198000122)
</pre>

- **Taxonomy and Site Information**: Neotoma Paleoecological Database.
- **Climate Model Output**: Climate Model Output used in the NicheViewer portion of the application is derived from global climate model simulations described [here](http://datadryad.org/resource/doi:10.5061/dryad.1597g).  Ciatation:
<pre>
Lorenz DJ, Nieto-Lugilde D, Blois JL, Fitzpatrick MC, Williams JW (2016) Downscaled and debiased climate simulations for North America from 21,000 years ago to 2100AD. Scientific Data 3: 160048. http://dx.doi.org/10.1038/sdata.2016.48
</pre>

#### Technology
The application is hosted on the University of Wisconsin, Madison campus.



