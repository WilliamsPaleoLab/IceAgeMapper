# Javascript File Structure Readme
### March 30, 2017

The majority of the IAM interface is controlled via custom javascript components. This document explains their organization and the method of their compilation.

## Structure
The main IAM interface (```iam.html```) consumes a minified bundle of javascript. The bundle and individual component files are located in ```modules```.

Other ancillary components, such as the landing page, gallery, and taxonomy, have their own folders for javascript.

### Main IAM Interface
This bundle is a concatenation of many individual modules of javascript, designed to be small and independent.

#### Minified File
The full minified file is located in ```modules/static/bundle.js```

#### Controller File
The main application file (unminified development file) is ```modules/main.js```. This file loads the necessary libraries and intializes the application.

#### Module Files
Application components are written in logically separated files. Each module contains between 1 and ~10 functions that work on a conceptually related purpose. Each file has its own immediately invoked function closure that returns an object. The object is then returned from the module in the ```module.exports``` property. Each module's functions are therefore accessed by ```moduleName.functionName```.

#### Building the bundle
The application is built using node and browserify/watchify. To build for development (from project root):

```
  watchify js/modules/main.js -o js/modules/static/bundle.js --verbose --poll
```

This command will concatenate and minify all required files. If using watchify, the bundle should update every time a file is changed.

### Gallery
The gallery component was created with Angular.js (v1) as an experiment and a test-case to see if the full IAM interface should convert to this framework. All files required for the gallery are in the ```gallery``` directory. The gallery creates a new ```galleryList``` components.

While the angular experiment works well for the gallery, I do not think it is a good idea to base the entire IAM on angular, because of the extensive visualizations required.

### Landing Page
The landing page has only limited interactivity. Only a single javascript file is required (```landingPage/landing-page.js```).

### Taxonomy
To be added.


## Tests
The development of IAM has revealed the importance of end-to-end/acceptance tests. I've been working to improve the testing structure of the application, though it is still limited. Presently, the gallery is tested independently, and e2e tests are executed on the landing page and IAM.

While unit tests seem like a good idea, I think that only acceptance tests are feasible at this point in development.
