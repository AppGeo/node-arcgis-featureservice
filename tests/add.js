var test = require('tape');
var FeatureService = require('../src/index');

test('has add method', function (t) {
  var svc = new FeatureService({
    url: 'http://fake.map.service',
    idField: 'id'
  });
  
  t.equals(typeof svc.add, 'function', '`add` is a function');
  t.end();
});
