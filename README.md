# mume-html5

This repository contains the source code of the HTML5 application for the Multimedia Course at KU Leuven, Belgium.

## HTML5 Features

This section explains the different HTML5 features leveraged.

### App Cache
In order to run offline, the application is supposed to be cached by the browser. In HTML5, you can add a manifest, listing all the files required for offline operation. 

```html
	<html lang="en" manifest="app.manifest">
```

For this to work properly, manifest files should be served with "content-type: text/cache-manifest" headers. GitHub Pages recognizes this type of file and takes care of the headers.

### Inline SVG
Plutchik's wheel on the "new mood" page is drawn using inline SVG. This has multiple advantages:
* SVG is XML, it is part of the DOM, so you can attach listeners to parts of the SVG. This is particularly useful for making parts of the SVG "draggable".
* It's vectors, what more is there to say?

### Web SQL & IndexedDB
The data of this application is stored in a database. WebSQL is supported on most mobile browsers, but specification of this standard has halted. IndexedDB has to take over but is not yet implemented in many systems. In order to prevent this from being an issue, we plan to implement a database abstraction layer.

### Geolocation
In order to obtain the user's location, we use the HTML5 geolocation feature.

### (More to come...)
