var test = require('tape');
var FeatureService = require('../src/index');

test('has delete method', function (t) {
  var svc = new FeatureService({
    url: 'http://fake.map.service',
    idField: 'id'
  });
  
  t.equals(typeof svc.delete, 'function', '`delete` is a function');
  t.end();
});
