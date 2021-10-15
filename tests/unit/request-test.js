import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { isNotFoundResponse } from 'ember-fetch/errors';
import Pretender from 'pretender';
import request from 'ember-ajax-fetch/request';

module('Unit | request', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = new Pretender();
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('produces data', function (assert) {
    const photos = [
      { id: 10, src: 'http://media.giphy.com/media/UdqUo8xvEcvgA/giphy.gif' },
      { id: 42, src: 'http://media0.giphy.com/media/Ko2pyD26RdYRi/giphy.gif' },
    ];
    this.server.get('/photos', function () {
      return [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(photos),
      ];
    });
    return request('/photos').then(function (data) {
      assert.deepEqual(data, photos);
    });
  });

  test('rejects promise when 404 is returned', function (assert) {
    this.server.get('/photos', function () {
      return [404, { 'Content-Type': 'application/json' }];
    });

    let errorCalled;
    return request('/photos')
      .then(function () {
        errorCalled = false;
      })
      .catch(function (response) {
        assert.ok(isNotFoundResponse(response));
        errorCalled = true;
      })
      .finally(function () {
        assert.ok(errorCalled);
      });
  });
});
