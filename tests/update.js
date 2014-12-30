var test = require('tape');
var FeatureService = require('../src/index');

test('has update method', function (t) {
  var svc = new FeatureService({
    url: 'http://fake.map.service',
    idField: 'id'
  });
  
  t.equals(typeof svc.update, 'function', '`update` is a function');
  t.end();
});
