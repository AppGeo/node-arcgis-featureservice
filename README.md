ArcGIS Feature Service
======================

A simple GeoJSON API for dealing with ArcGIS Feature Services.

## Usage

Initialize a feature service by providing a `url` and `idField`, and optionally a `token`.

```javascript
var FeatureService = require('arcgis-featureservice');

var svc = new FeatureService({
  url: 'http://mysite.com/arcgis/rest/services/MyService/FeatureServer/0',
  idField: 'OBJECTID',
  token: 'abc123'
});
```
Perform the basic CRUD operations, using GeoJSON as the data format.

```javascript
svc.get({ where: '1=1' }, function (err, featureCollection) {/* ... */});
svc.add(feature, function (err) {/* ... */});
svc.update(feature, function (err) {/* ... */});
svc.delete(id, function (err) {/* ... */});
```

## Debugging

This module uses the `debug` module to provide debugging information during usage. To enable it, set the DEBUG
environment variable to 'arcgis-featureservice'. See https://github.com/visionmedia/debug#usage for more details.

## Testing

```
npm test
```
