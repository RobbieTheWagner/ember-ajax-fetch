/* eslint-disable ember/avoid-leaking-state-in-ember-objects */
import { A } from '@ember/array';
import { typeOf } from '@ember/utils';
import FetchRequest from 'ember-ajax-fetch/fetch-request';
import Pretender from 'pretender';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';
import { jsonFactory, jsonResponse } from 'dummy/tests/helpers/json';
// import { isTimeoutError } from 'ember-ajax-fetch/errors';
import {
  UnauthorizedError,
  InvalidError,
  ForbiddenError,
  BadRequestError,
  GoneError,
  ConflictError,
  ServerError
} from 'ember-ajax-fetch/errors';

const {
  matchers: { anything, contains: matchContains }
} = td;

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

  test('can override the default `contentType` for the service', function(assert) {
    const defaultContentType = 'application/json';

    class FetchServiceWithDefaultContentType extends FetchRequest {
      get contentType() {
        return defaultContentType;
      }
    }

    const service = FetchServiceWithDefaultContentType.create();
    const options = service.options('');
    assert.equal(options.contentType, defaultContentType);
  });

  test('raw() response.post === options.data.post', function(assert) {
    const service = FetchRequest.create();
    const url = '/posts';
    const title = 'Title';
    const description = 'Some description.';
    const contentType = 'application/json';
    const customHeader = 'My custom header';
    const options = {
      data: {
        post: { title, description }
      }
    };
    const serverResponse = [
      200,
      { 'Content-Type': contentType,
        'Custom-Header': customHeader },
      JSON.stringify(options.data)
    ];

    this.server.get(url, () => serverResponse);

    const rawPromise = service.raw(url, options);

    return rawPromise.then(function({ response }) {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Custom-Header'), customHeader);
      assert.equal(response.headers.get('Content-Type'), contentType);
      return response.json();
    }).then((json) => {
      assert.deepEqual(json.post, options.data.post);
    });
  });

  test('post() response.post === options.data.post', function(assert) {
    const service = FetchRequest.create();
    const url = '/posts';
    const title = 'Title';
    const description = 'Some description.';
    const options = {
      data: {
        post: { title, description }
      }
    };
    const serverResponse = [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(options.data)
    ];

    this.server.post(url, () => serverResponse);

    const postPromise = service.post(url, options);

    return postPromise.then(function(response) {
      assert.deepEqual(response.post, options.data.post);
    });
  });

  test('put() response.post === options.data.post', function(assert) {
    const service = FetchRequest.create();
    const url = '/posts/1';
    const title = 'Title';
    const description = 'Some description.';
    const id = 1;
    const options = {
      data: {
        post: { id, title, description }
      }
    };

    const serverResponse = [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(options.data)
    ];

    this.server.put(url, () => serverResponse);

    const putPromise = service.put(url, options);

    return putPromise.then(function(response) {
      assert.deepEqual(response.post, options.data.post);
    });
  });

  test('patch() response.post === options.data.post', function(assert) {
    const service = FetchRequest.create();
    const url = '/posts/1';
    const description = 'Some description.';
    const options = {
      data: {
        post: { description }
      }
    };

    const serverResponse = [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(options.data)
    ];

    this.server.patch(url, () => serverResponse);

    const patchPromise = service.patch(url, options);

    return patchPromise.then(function(response) {
      assert.deepEqual(response.post, options.data.post);
    });
  });

  test('del() response is {}', function(assert) {
    const service = FetchRequest.create();
    const url = '/posts/1';
    const serverResponse = [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({})
    ];

    this.server.delete(url, () => serverResponse);

    const delPromise = service.del(url);

    return delPromise.then(function(response) {
      assert.deepEqual(response, {});
    });
  });

  test('delete() response is {}', function(assert) {
    const service = FetchRequest.create();
    const url = '/posts/1';
    const serverResponse = [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({})
    ];

    this.server.delete(url, () => serverResponse);

    const deletePromise = service.delete(url);

    return deletePromise.then(function(response) {
      assert.deepEqual(response, {});
    });
  });

  test('request with method option makes the correct type of request', function(assert) {
    const url = '/posts/1';
    const serverResponse = [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({})
    ];

    this.server.get(url, () => {
      throw new Error('Shouldn\'t make an AJAX request');
    });
    this.server.post(url, () => serverResponse);

    const service = FetchRequest.create();
    const _handleResponse = td.function('handle response');
    const expectedArguments = [
      anything(),
      matchContains({ method: 'POST' }),
      anything()
    ];
    service._handleResponse = _handleResponse;
    td.when(_handleResponse(...expectedArguments)).thenReturn({});

    return service.request(url, { method: 'POST' }).then(() => {
      assert.verify(_handleResponse(...expectedArguments));
    });
  });

  module('explicit host in URL', function() {
    test('overrides host property of class', function(assert) {
      const RequestWithHost = FetchRequest.extend({
        host: 'https://discuss.emberjs.com'
      });

      const service = RequestWithHost.create();
      const url = 'http://myurl.com/users/me';
      const options = service.options(url);

      assert.equal(options.url, 'http://myurl.com/users/me');
    });

    test('overrides host property in request config', function(assert) {
      const service = FetchRequest.create();
      const host = 'https://discuss.emberjs.com';
      const url = 'http://myurl.com/users/me';
      const options = service.options(url, { host });

      assert.equal(options.url, 'http://myurl.com/users/me');
    });

    test('without a protocol does not override config property', function(assert) {
      const RequestWithHost = FetchRequest.extend({
        host: 'https://discuss.emberjs.com'
      });

      const service = RequestWithHost.create();
      const url = 'myurl.com/users/me';
      const options = service.options(url);

      assert.equal(options.url,
        'https://discuss.emberjs.com/myurl.com/users/me'
      );
    });
  });

  module('headers', function() {
    test('is set if the URL matches the host', function(assert) {
      this.server.get('http://example.com/test', req => {
        const { requestHeaders } = req;
        assert.equal(requestHeaders['Content-Type'], 'application/json');
        assert.equal(requestHeaders['Other-key'], 'Other Value');
        return jsonResponse();
      });

      const RequestWithHeaders = FetchRequest.extend({
        host: 'http://example.com',
        headers: {
          'Content-Type': 'application/json',
          'Other-key': 'Other Value'
        }
      });

      const service = RequestWithHeaders.create();
      return service.request('http://example.com/test');
    });

    test('is set if the URL is relative', function(assert) {
      this.server.get('/some/relative/url', req => {
        const { requestHeaders } = req;
        assert.equal(requestHeaders['Content-Type'], 'application/json');
        assert.equal(requestHeaders['Other-key'], 'Other Value');
        return jsonResponse();
      });

      const RequestWithHeaders = FetchRequest.extend({
        headers: {
          'Content-Type': 'application/json',
          'Other-key': 'Other Value'
        }
      });

      const service = RequestWithHeaders.create();
      return service.request('/some/relative/url');
    });

    test('is set if the URL matches one of the RegExp trustedHosts', function(assert) {
      this.server.get('http://my.example.com', req => {
        const { requestHeaders } = req;
        assert.equal(requestHeaders['Other-key'], 'Other Value');
        return jsonResponse();
      });

      const RequestWithHeaders = FetchRequest.extend({
        host: 'some-other-host.com',
        trustedHosts: A([4, 'notmy.example.com', /example\./]),
        headers: {
          'Content-Type': 'application/json',
          'Other-key': 'Other Value'
        }
      });

      const service = RequestWithHeaders.create();
      return service.request('http://my.example.com');
    });

    test('is set if the URL matches one of the string trustedHosts', function(assert) {
      this.server.get('http://foo.bar.com', req => {
        const { requestHeaders } = req;
        assert.equal(requestHeaders['Other-key'], 'Other Value');
        return jsonResponse();
      });

      const RequestWithHeaders = FetchRequest.extend({
        host: 'some-other-host.com',
        trustedHosts: A(['notmy.example.com', /example\./, 'foo.bar.com']),
        headers: {
          'Content-Type': 'application/json',
          'Other-key': 'Other Value'
        }
      });

      const service = RequestWithHeaders.create();
      return service.request('http://foo.bar.com');
    });

    test('is not set if the URL does not match the host', function(assert) {
      this.server.get('http://example.com', req => {
        const { requestHeaders } = req;
        assert.notEqual(requestHeaders['Other-key'], 'Other Value');
        return jsonResponse();
      });

      const RequestWithHeaders = FetchRequest.extend({
        host: 'some-other-host.com',
        headers: {
          'Content-Type': 'application/json',
          'Other-key': 'Other Value'
        }
      });

      const service = RequestWithHeaders.create();
      return service.request('http://example.com');
    });

    test('can be supplied on a per-request basis', function(assert) {
      this.server.get('http://example.com', req => {
        const { requestHeaders } = req;
        assert.equal(requestHeaders['Per-Request-Key'], 'Some value');
        assert.equal(requestHeaders['Other-key'], 'Other Value');
        return jsonResponse();
      });

      const RequestWithHeaders = FetchRequest.extend({
        host: 'http://example.com',
        headers: {
          'Content-Type': 'application/json',
          'Other-key': 'Other Value'
        }
      });

      const service = RequestWithHeaders.create();
      return service.request('http://example.com', {
        headers: {
          'Per-Request-Key': 'Some value'
        }
      });
    });

    test('can get the full list from class and request options', function(assert) {
      const RequestWithHeaders = FetchRequest.extend({
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Other-Value': 'Some Value'
        }
      });

      const service = RequestWithHeaders.create();
      const headers = { 'Third-Value': 'Other Thing' };
      assert.equal(Object.keys(service._getFullHeadersHash()).length, 2);
      assert.equal(Object.keys(service._getFullHeadersHash(headers)).length,
        3
      );
      assert.equal(Object.keys(service.headers).length, 2);
    });
  });

  test('it creates a detailed error message for unmatched server errors with an AJAX payload', function(assert) {
    const response = [
      408,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ errors: ['Some error response'] })
    ];
    this.server.get('/posts', () => response);

    const service = FetchRequest.create();
    return service
      .request('/posts')
      .then(function() {
        throw new Error('success handler should not be called');
      })
      .catch(function(result) {
        assert.ok(result.message.includes('Some error response'));
        assert.ok(result.message.includes('GET'));
        assert.ok(result.message.includes('/posts'));
        assert.equal(result.status, 408);
      });
  });

  test('it creates a detailed error message for unmatched server errors with a text payload', function(assert) {
    const response = [
      408,
      { 'Content-Type': 'text/html' },
      'Some error response'
    ];
    this.server.get('/posts', () => response);

    const service = FetchRequest.create();
    return service
      .request('/posts')
      .then(function() {
        throw new Error('success handler should not be called');
      })
      .catch(function(result) {
        assert.ok(result.message.includes('Some error response'));
        assert.ok(result.message.includes('GET'));
        assert.ok(result.message.includes('/posts'));
        assert.equal(result.status, 408);
      });
  });

  test('it throws an error when the user tries to use `.get` to make a request', function(assert) {
    const service = FetchRequest.create();
    service.set('someProperty', 'foo');

    assert.equal(service.get('someProperty'), 'foo');

    assert.throws(function() {
      service.get('/users');
    });

    assert.throws(function() {
      service.get('/users', {});
    });
  });

  test('it JSON encodes JSON request data automatically per contentType', function(assert) {
    this.server.post('/test', ({ requestBody }) => {
      const { foo } = JSON.parse(requestBody);
      assert.equal(foo, 'bar');
      return jsonResponse();
    });

    const RequestWithHeaders = FetchRequest.extend({
      contentType: 'application/json'
    });

    const service = RequestWithHeaders.create();
    return service.post('/test', {
      data: {
        foo: 'bar'
      }
    });
  });

  test('it JSON encodes JSON:API request data automatically per contentType', function(assert) {
    this.server.post('/test', ({ requestBody }) => {
      const { foo } = JSON.parse(requestBody);
      assert.equal(foo, 'bar');
      return jsonResponse();
    });

    const RequestWithHeaders = FetchRequest.extend({
      contentType: 'application/vnd.api+json'
    });

    const service = RequestWithHeaders.create();
    return service.post('/test', {
      data: {
        foo: 'bar'
      }
    });
  });

  test('it JSON encodes JSON request data automatically per Content-Type header', function(assert) {
    this.server.post('/test', ({ requestBody }) => {
      const { foo } = JSON.parse(requestBody);
      assert.equal(foo, 'bar');
      return jsonResponse();
    });

    const RequestWithHeaders = FetchRequest.extend({
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const service = RequestWithHeaders.create();
    return service.post('/test', {
      data: {
        foo: 'bar'
      }
    });
  });

  test('it JSON encodes JSON:API request data automatically per Content-Type header', function(assert) {
    this.server.post('/test', ({ requestBody }) => {
      const { foo } = JSON.parse(requestBody);
      assert.equal(foo, 'bar');
      return jsonResponse();
    });

    const RequestWithHeaders = FetchRequest.extend({
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    });

    const service = RequestWithHeaders.create();
    return service.post('/test', {
      data: {
        foo: 'bar'
      }
    });
  });

  test('it does not JSON encode query parameters when JSON:API headers are present', function(assert) {
    this.server.get('/test', ({ queryParams }) => {
      const { foo } = queryParams;
      assert.equal(foo, 'bar');
      return jsonResponse();
    });

    const RequestWithHeaders = FetchRequest.extend({
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    });

    const service = RequestWithHeaders.create();
    return service.request('/test', {
      data: {
        foo: 'bar'
      }
    });
  });

  test('it JSON encodes JSON:API "extension" request data automatically', function(assert) {
    this.server.post('/test', ({ requestBody }) => {
      const { foo } = JSON.parse(requestBody);
      assert.equal(foo, 'bar');
      return jsonResponse();
    });

    const RequestWithHeaders = FetchRequest.extend({
      headers: {
        'Content-Type': 'application/vnd.api+json; ext="ext1,ext2"'
      }
    });

    const service = RequestWithHeaders.create();
    return service.post('/test', {
      data: {
        foo: 'bar'
      }
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

  module('error handlers', function() {
    // test('handles a TimeoutError correctly', function(assert) {
    //   this.server.get('/posts', jsonFactory(200), 2);
    //   const service = FetchRequest.create();
    //   return service
    //     .request('/posts', { timeout: 1 })
    //     .then(function() {
    //       throw new Error('success handler should not be called');
    //     })
    //     .catch(function(reason) {
    //       assert.ok(isTimeoutError(reason));
    //       assert.equal(reason.payload, null);
    //       assert.equal(reason.status, -1);
    //     });
    // });

    function errorHandlerTest(status, errorClass) {
      test(`handles a ${status} response correctly and preserves the payload`, function(assert) {
        this.server.get(
          '/posts',
          jsonFactory(status, {
            errors: [{ id: 1, message: 'error description' }]
          })
        );
        const service = FetchRequest.create();
        return service
          .request('/posts')
          .then(function() {
            throw new Error('success handler should not be called');
          })
          .catch(function(reason) {
            assert.ok(reason instanceof errorClass);
            assert.ok(reason.payload !== undefined);
            assert.equal(reason.status, status);

            const { errors } = reason.payload;

            assert.ok(errors && typeOf(errors) === 'array');
            assert.equal(errors[0].id, 1);
            assert.equal(errors[0].message, 'error description');
          });
      });
    }

    errorHandlerTest(401, UnauthorizedError);
    errorHandlerTest(403, ForbiddenError);
    errorHandlerTest(409, ConflictError);
    errorHandlerTest(410, GoneError);
    errorHandlerTest(422, InvalidError);
    errorHandlerTest(400, BadRequestError);
    errorHandlerTest(500, ServerError);
    errorHandlerTest(502, ServerError);
    errorHandlerTest(510, ServerError);
  });
});
