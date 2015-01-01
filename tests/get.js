var test = require('tape');
var nock = require('nock');
var FeatureService = require('../src/index');

var svc = new FeatureService({
  url: 'http://fake.map.service',
  idField: 'id'
});

test('has get method', function (t) {
  t.equals(typeof svc.get, 'function', '`get` is a function');
  t.end();
});

test('get method makes the correct api call', function (t) {
  nock.cleanAll();
  nock('http://fake.map.service')
    .filteringPath(function (path) {
      return '/query';
    })
    .get('/query')
    .reply(200, {
      junk: true,
      features: [
      {
        attributes: {
          foo: 'bar'
        }
      }
      ]
    });
  
  svc.get({ foo: 'bar' }, function (err, data) {
    t.notOk(err, '`err` is not defined');
    t.equals(data.type, 'FeatureCollection', 'result is a FeatureCollection');
    t.equals(data.features.length, 1, 'result has features');
    t.equals(data.features[0].properties.foo, 'bar', 'result\'s features have the right properties');
    t.end();
  });
});

test('get method wraps server error', function (t) {
  nock.cleanAll();
  nock('http://fake.map.service')
    .filteringPath(function (path) {
      return '/query';
    })
    .get('/query')
    .reply(200, {
      error: {
        message: 'fake error message'
      }
    });
  
  svc.get({ foo: 'bar' }, function (err, data) {
    t.ok(err instanceof Error, '`err` is an instance of Error');
    t.equals(err.message, 'fake error message', '`err.message` is as expected');
    t.end();
  });
});
