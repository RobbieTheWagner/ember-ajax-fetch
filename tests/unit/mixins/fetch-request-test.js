import FetchRequest from 'ember-ajax-fetch/fetch-request';
import Pretender from 'pretender';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Mixin | fetch-request', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.server = new Pretender();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
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
