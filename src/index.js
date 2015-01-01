'use strict';

var request = require('request');
var defaults = require('lodash.defaults');
var arcgis = require('terraformer-arcgis-parser');
var debug = require('debug')('arcgis-featureservice');

/**
 * @constructor
 * @param options {object} url and idField for feature service. E.g.:
 *   {
 *     url: 'http://your.site.com/arcgis/rest/services/YourService/MapServer/0',
 *     idField: 'OBJECTID',
 *     token: 'token-from-arcgis'
 *   }
 */
function FeatureService(options) {
  debug('creating instance of feature service');
  
  if(!(this instanceof FeatureService)) {
    return new FeatureService(options);
  }
  
  this.defaultSettings = {
    defaultResultOptions: {
      returnCountsOnly: false,
      returnIdsOnly: false,
      returnGeometry: true,
      outSR: '4326',
      outFields: '*',
      f: 'json'
    }
  };
  
  this.settings = options ? defaults(options, this.defaultSettings) : this.defaultSettings;
  
  if(options && options.defaultResultOptions) {
    this.settings.defaultResultOptions = defaults(options.defaultResultOptions, this.defaultSettings.defaultResultOptions);
  }
}

/**
 * NOTE: when dealing with strings, always use '' single quotes
 *
 * @param params {object} query parameters (e.g. { where: 'TransTech > 10' }).
 * @param callback {function} fn(error, geojson)
 */
FeatureService.prototype.get = function(params, callback) {
  debug('invoking get function');
  
  var paramsWithDefaults = defaults(params, this.settings.defaultResultOptions);
  paramsWithDefaults.token = this.token;
  
  debug('params: %s', stringify(paramsWithDefaults));
  
  request.get({
    url: this.settings.url + '/query',
    qs: paramsWithDefaults,
    json: true
  }, function _getRequestCallback(err, response, body) {
    debug('get response: %s', stringify(body));
    
    if (err) {
      return callback(err);
    }
    
    if (body.error) {
      return callback(new Error(body.error.message));
    }
    
    var esriFeatures = body.features;
    var geojsonFeatures = esriFeatures.map(function(feature) {
      return arcgis.parse(feature);
    });
    var geojson = {
      type: 'FeatureCollection',
      features: geojsonFeatures
    };
    
    return callback(null, geojson);
    
  });
};

/**
 * @param geojson {object} feature to add.
 * @param callback {function} fn(error, geojson)
 */
FeatureService.prototype.add = function(geojson, callback) {
  debug('invoking add function');
  var esriJson = arcgis.convert(geojson);
  
  // Get around bug in the arcgis#convert method
  delete esriJson.attributes.OBJECTID;

  request.post({
    f: 'json',
    url: this.settings.url + '/addFeatures',
    form: {
      f:'json',
      features: JSON.stringify([esriJson]),
      token: this.token
    }
  }, handleEsriResponse(callback));
};

/**
 * @param geojson {object} feature with properties to update.
 * @param callback {function} fn(error)
 */
FeatureService.prototype.update = function(geojson, callback) {
  debug('invoking update function');
  var esriJson = arcgis.convert(geojson);
  
  // Convert OBJECTID to a number.
  esriJson.attributes.OBJECTID = Number(esriJson.attributes.OBJECTID);
  
  request.post({
    f: 'json',
    url: this.settings.url + '/updateFeatures',
    form: {
      f:'json',
      features: JSON.stringify([esriJson]),
      token: this.token
    }
  }, handleEsriResponse(callback));
};

/**
 * @param id {string} id of feature to delete.
 * @param callback {function} fn(error)
 */
FeatureService.prototype.delete = function(id, callback) {
  debug('invoking delete function');
  request.post({
    url: this.settings.url + '/deleteFeatures',
    form: {
      objectIds: id,
      f: 'json',
      rollbackOnFailure: true,
      token: this.token
    },
  }, handleEsriResponse(callback));
};

/**
 * Returns a function that handles the response of an arcgis add/update/delete request.
 *
 * @param callback {function} fn(error)
 */
function handleEsriResponse(callback) {
  return function(err, response, body) {
    var error;
    
    if (err) {
      return callback(err);
    }
    
    var json = body && JSON.parse(body);
    if (!json) {
      return callback(new Error('Response body was null or could not be parsed'));
    }
    
    // Get the results object from the response, which is the first and only object.
    // Since batch requests aren't implemented, this should be one of addResults, updateResults, or deleteResults.
    var results = json[Object.keys(json)[0]];
    if (!results || !results.length) {
      return callback(new Error('Results object not found or is not as expected'));
    }
    
    // Assume we only get one result back (due to unimplemented batch operations).
    var result = results[0];
    
    if (result.success) {
      return callback(null);
    } else if (result.error) {
      error = new Error(result.error.description);
      error.code = result.error.code;
      return callback(error);
    } else {
      error = new Error('Feature service error: unexpected result');
      error.result = result;
      return callback(error);
    }
  };
}

function stringify(x) {
  return JSON.stringify(x, null, 2);
}

module.exports = FeatureService;
