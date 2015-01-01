var test = require('tape');
var nock = require('nock');
var FeatureService = require('../src/index');

var svc = new FeatureService({
  url: 'http://fake.map.service',
  idField: 'id'
});

test('has add method', function (t) {
  t.equals(typeof svc.add, 'function', '`add` is a function');
  t.end();
});

test('add method wraps server error', function (t) {
  nock.cleanAll();
  nock('http://fake.map.service')
    .filteringPath(function (path) {
      return '/addFeatures'
    })
    .post('/addFeatures')
    .reply(200, {
      addResults: [
        {
          "success": false,
          "error": {
            "code": -2147217395,
            "description": "Setting of Value for depth failed."
          }
        }
      ]
    });
  
  svc.add({ foo: 'bar' }, function (err, data) {
    t.ok(err instanceof Error, '`err` is an instance of Error');
    t.equals(err.message, 'Setting of Value for depth failed.', '`err.message` is as expected');
    t.end();
  });
});
