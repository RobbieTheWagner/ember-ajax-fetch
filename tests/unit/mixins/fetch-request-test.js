import FetchRequest from 'ember-ajax-fetch/fetch-request';
import Pretender from 'pretender';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { jsonResponse } from 'dummy/tests/helpers/json';

module('Unit | Mixin | fetch-request', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.server = new Pretender();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  module('options method', function() {
    test('sets raw data', function(assert) {
      const service = FetchRequest.create();
      const url = '/test';
      const type = 'GET';
      const options = service.options(url, {
        type,
        data: { key: 'value' }
      });

      assert.deepEqual(options, {
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
          key: 'value'
        },
        dataType: 'json',
        headers: {},
        type: 'GET',
        url: '/test'
      });
    });

    test('sets options correctly', function(assert) {
      const service = FetchRequest.create();
      const url = '/test';
      const type = 'POST';
      const data = JSON.stringify({ key: 'value' });
      const options = service.options(url, {
        type,
        data,
        contentType: 'application/json; charset=utf-8'
      });

      assert.deepEqual(options, {
        contentType: 'application/json; charset=utf-8',
        data: '{"key":"value"}',
        dataType: 'json',
        headers: {},
        type: 'POST',
        url: '/test'
      });
    });

    test('does not modify the options object argument', function(assert) {
      const service = FetchRequest.create();
      const url = 'test';
      const data = JSON.stringify({ key: 'value' });
      const baseOptions = { type: 'POST', data };
      service.options(url, baseOptions);
      assert.deepEqual(baseOptions, { type: 'POST', data });
    });

    test('does not override contentType when defined', function(assert) {
      const service = FetchRequest.create();
      const url = '/test';
      const type = 'POST';
      const data = JSON.stringify({ key: 'value' });
      const options = service.options(url, {
        type,
        data,
        contentType: false
      });

      assert.deepEqual(options, {
        contentType: false,
        data: '{"key":"value"}',
        dataType: 'json',
        headers: {},
        type: 'POST',
        url: '/test'
      });
    });

    test('can handle empty data', function(assert) {
      const service = FetchRequest.create();
      const url = '/test';
      const type = 'POST';
      const options = service.options(url, { type });

      assert.deepEqual(options, {
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        headers: {},
        type: 'POST',
        url: '/test'
      });
    });

    test('is only called once per call to request', function(assert) {
      let numberOptionsCalls = 0;

      this.server.get('/foo', () => jsonResponse());

      const MonitorOptionsCalls = FetchRequest.extend({
        options() {
          numberOptionsCalls = numberOptionsCalls + 1;
          return this._super(...arguments);
        }
      });

      const service = MonitorOptionsCalls.create();
      return service.request('/foo').then(function() {
        assert.equal(numberOptionsCalls, 1);
      });
    });

    module('host', function() {
      test('is set on the url (url starting with `/`)', function(assert) {
        const RequestWithHost = FetchRequest.extend({
          host: 'https://discuss.emberjs.com'
        });

        const service = RequestWithHost.create();
        const url = '/users/me';
        const options = service.options(url);

        assert.equal(options.url,
          'https://discuss.emberjs.com/users/me'
        );
      });

      test('is set on the url (url not starting with `/`)', function(assert) {
        const RequestWithHost = FetchRequest.extend({
          host: 'https://discuss.emberjs.com'
        });

        const service = RequestWithHost.create();
        const url = 'users/me';
        const options = service.options(url);

        assert.equal(options.url,
          'https://discuss.emberjs.com/users/me'
        );
      });

      test('is overridable on a per-request basis', function(assert) {
        const RequestWithHost = FetchRequest.extend({
          host: 'https://discuss.emberjs.com'
        });

        const service = RequestWithHost.create();
        const url = 'users/me';
        const host = 'https://myurl.com';
        const options = service.options(url, { host });

        assert.equal(options.url, 'https://myurl.com/users/me');
      });

      test('is set on the namespace(namespace not starting with `/`)', function(assert) {
        const RequestWithHostAndNamespace = FetchRequest.extend({
          host: 'https://discuss.emberjs.com',
          namespace: 'api/v1'
        });
        const service = RequestWithHostAndNamespace.create();
        const url = 'users/me';
        const options = service.options(url);

        assert.equal(options.url,
          'https://discuss.emberjs.com/api/v1/users/me'
        );
      });

      test('is set on the namespace(namespace starting with `/`)', function(assert) {
        const RequestWithHostAndNamespace = FetchRequest.extend({
          host: 'https://discuss.emberjs.com',
          namespace: '/api/v1'
        });
        const service = RequestWithHostAndNamespace.create();
        const url = 'users/me';
        const options = service.options(url);

        assert.equal(options.url,
          'https://discuss.emberjs.com/api/v1/users/me'
        );
      });

      test('is set on the url containing namespace', function(assert) {
        const RequestWithHostAndNamespace = FetchRequest.extend({
          host: 'https://discuss.emberjs.com',
          namespace: '/api/v1'
        });
        const service = RequestWithHostAndNamespace.create();

        assert.equal(service.options('/api/v1/users/me').url,
          'https://discuss.emberjs.com/api/v1/users/me'
        );
        assert.equal(service.options('api/v1/users/me').url,
          'https://discuss.emberjs.com/api/v1/users/me'
        );
      });

      test('is set on the url containing namespace no leading slash', function(assert) {
        const RequestWithHostAndNamespace = FetchRequest.extend({
          host: 'https://discuss.emberjs.com',
          namespace: 'api/v1'
        });
        const service = RequestWithHostAndNamespace.create();

        assert.equal(service.options('/api/v1/users/me').url,
          'https://discuss.emberjs.com/api/v1/users/me'
        );
        assert.equal(service.options('api/v1/users/me').url,
          'https://discuss.emberjs.com/api/v1/users/me'
        );
      });

      test('is set with the host address as `//` and url not starting with `/`', function(assert) {
        const RequestWithHostAndNamespace = FetchRequest.extend({
          host: '//'
        });
        const service = RequestWithHostAndNamespace.create();
        const url = 'users/me';
        const options = service.options(url);

        assert.equal(options.url, '//users/me');
      });

      test('is set with the host address as `//` and url starting with `/`', function(assert) {
        const RequestWithHostAndNamespace = FetchRequest.extend({
          host: '//'
        });
        const service = RequestWithHostAndNamespace.create();
        const url = '/users/me';
        const options = service.options(url);

        assert.equal(options.url, '//users/me');
      });
    });

    module('namespace', function() {
      test('is set on the url (namespace starting with `/`)', function(assert) {
        const RequestWithHost = FetchRequest.extend({
          namespace: '/api/v1'
        });

        const service = RequestWithHost.create();

        assert.equal(service.options('/users/me').url, '/api/v1/users/me');
        assert.equal(service.options('users/me').url, '/api/v1/users/me');
      });

      test('can be set on a per-request basis', function(assert) {
        const service = FetchRequest.create();

        assert.equal(service.options('users/me', { namespace: '/api' }).url,
          '/api/users/me'
        );
        assert.equal(service.options('users/me', { namespace: 'api' }).url,
          'api/users/me'
        );
      });

      test('is set on the url (namespace not starting with `/`)', function(assert) {
        const RequestWithHost = FetchRequest.extend({
          namespace: 'api/v1'
        });

        const service = RequestWithHost.create();

        assert.equal(service.options('/users/me').url, 'api/v1/users/me');
        assert.equal(service.options('users/me').url, 'api/v1/users/me');
      });
    });

    module('type', function() {
      test('defaults to GET', function(assert) {
        const service = FetchRequest.create();
        const url = 'test';
        const options = service.options(url);

        assert.equal(options.type, 'GET');
      });
    });
  });

  module('URL building', function() {
    class NamespaceLeadingSlash extends FetchRequest {
      static get slashType() {
        return 'leading slash';
      }

      get namespace() {
        return '/bar';
      }
    }

    class NamespaceTrailingSlash extends FetchRequest {
      static get slashType() {
        return 'trailing slash';
      }

      get namespace() {
        return 'bar/';
      }
    }

    class NamespaceTwoSlash extends FetchRequest {
      static get slashType() {
        return 'leading and trailing slash';
      }

      get namespace() {
        return '/bar/';
      }
    }

    class NamespaceNoSlash extends FetchRequest {
      static get slashType() {
        return 'no slashes';
      }

      get namespace() {
        return 'bar';
      }
    }

    const hosts = [
      { hostType: 'trailing slash', host: 'http://foo.com/' },
      { hostType: 'no trailing slash', host: 'http://foo.com' }
    ];

    [
      NamespaceLeadingSlash,
      NamespaceTrailingSlash,
      NamespaceTwoSlash,
      NamespaceNoSlash
    ].forEach(Klass => {
      const req = Klass.create();

      hosts.forEach(exampleHost => {
        const { host } = exampleHost;

        test(`correctly handles ${Klass.slashType} when the host has ${
          exampleHost.hostType
        }`, function(assert) {
          ['/baz', 'baz'].forEach(segment => {
            assert.equal(req._buildURL(segment, { host }),
              'http://foo.com/bar/baz'
            );
          });
          ['/baz/', 'baz/'].forEach(segment => {
            assert.equal(req._buildURL(segment, { host }),
              'http://foo.com/bar/baz/'
            );
          });
        });
      });
    });

    test('correctly handles a host provided on the request options', function(assert) {
      const req = FetchRequest.create();
      assert.equal(req._buildURL('/baz', { host: 'http://foo.com' }), 'http://foo.com/baz');
    });

    test('correctly handles no namespace or host', function(assert) {
      const req = FetchRequest.create();
      assert.equal(req._buildURL('/baz'), '/baz');
      assert.equal(req._buildURL('baz'), 'baz');
    });

    test('does not build the URL if the namespace is already present', function(assert) {
      class RequestWithNamespace extends FetchRequest {
        get namespace() {
          return 'api';
        }
      }

      const req = RequestWithNamespace.create();
      assert.equal(req._buildURL('/api/post'),
        '/api/post',
        'URL provided with leading slash'
      );
      assert.equal(req._buildURL('api/post'),
        'api/post',
        'URL provided without leading slash'
      );
    });

    test('correctly handles a URL with leading part similar to the namespace', function(assert) {
      class RequestWithNamespace extends FetchRequest {
        get namespace() {
          return 'admin';
        }
      }

      const req = RequestWithNamespace.create();
      assert.equal(req._buildURL('/admin_users/post'),
        'admin/admin_users/post'
      );
    });

    module('building relative URLs', function() {
      test('works with a relative namespace with no trailing slash', function(assert) {
        class RelativeNamespace extends FetchRequest {
          get namespace() {
            return 'api/v1';
          }
        }

        const req = RelativeNamespace.create();
        assert.equal(req._buildURL('foobar'), 'api/v1/foobar');
      });

      test('works with a relative namespace with a trailing slash', function(assert) {
        class RelativeNamespace extends FetchRequest {
          get namespace() {
            return 'api/v1/';
          }
        }

        const req = RelativeNamespace.create();
        assert.equal(req._buildURL('foobar'), 'api/v1/foobar');
      });
    });

    module('building a URL with a host', function() {
      test('correctly handles a host without a namespace', function(assert) {
        class HostWithoutNamespace extends FetchRequest {
          get host() {
            return 'http://foo.com';
          }
        }

        const req = HostWithoutNamespace.create();
        assert.equal(req._buildURL('baz'), 'http://foo.com/baz');
      });

      test('does not build the URL if the host is already present', function(assert) {
        class RequestWithHost extends FetchRequest {
          get host() {
            return 'https://foo.com';
          }
        }

        const req = RequestWithHost.create();
        assert.equal(req._buildURL('https://foo.com/posts'),
          'https://foo.com/posts'
        );
      });
    });
  });
});
