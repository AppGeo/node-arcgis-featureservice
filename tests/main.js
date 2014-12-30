var test = require('tape');
var FeatureService = require('../src/index');

test('module exists', function (t) {
  t.equals(typeof FeatureService, 'function', '`FeatureService` is a function');
  t.end();
});

test('module exposes configuration settings', function (t) {
  var svc = new FeatureService({
    url: 'http://fake.map.service',
    idField: 'id',
    token: 'secret'
  });

  t.equals(typeof svc.settings, 'object', '`settings` is an object');
  t.equals(svc.settings.url, 'http://fake.map.service', '`settings.url` is correct');
  t.equals(svc.settings.idField, 'id', '`settings.idField` is correct');
  t.equals(svc.settings.token, 'secret', '`settings.token` is correct');
  t.end();
});
