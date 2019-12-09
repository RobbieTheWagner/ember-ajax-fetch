# Usage

## Basic Usage

In general, you will use the `request(url, options)` method, where url is the destination of the request and options is a 
configuration hash compatible with `ember-ajax`, which will be transformed to use with `fetch`.

```js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FooRoute extends Route {
  @service fetch;

  const queryParams = {
    'filter[interval_type]': 'month'
  };
  
  model() { 
    return this.fetch.request('/foo/bar', {
      data: queryParams
    });
  }
}
```

### HTTP-verbed methods

You can skip setting the `method` or `type` keys in your `options` object when
calling `request(url, options)` by instead calling `post(url, options)`,
`put(url, options)`, `patch(url, options)` or `del(url, options)`.

```js
post('/posts', { data: { title: 'Ember' } }); // Makes a POST request to /posts
put('/posts/1', { data: { title: 'Ember' } }); // Makes a PUT request to /posts/1
patch('/posts/1', { data: { title: 'Ember' } }); // Makes a PATCH request to /posts/1
del('/posts/1'); // Makes a DELETE request to /posts/1
```

### Custom Request Headers

`ember-ajax-fetch` allows you to specify headers to be used with a request. This is
especially helpful when you have a session service that provides an auth token
that you have to include with the requests to authorize your requests.

To include custom headers to be used with your requests, you can specify
`headers` hash on the `Fetch Service`.

```js
// app/services/fetch.js

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import FetchService from 'ember-ajax-fetch/services/fetch';

export default class ExtendedFetchService extends FetchService {
  @service session;

  @computed('session.authToken')
  get headers() {
    let headers = {};
    const authToken = this.get('session.authToken');
    if (authToken) {
      headers['auth-token'] = authToken;
    }
    return headers;
 }
}
```

Headers by default are only passed if the hosts match, or the request is a relative path.
You can overwrite this behavior by either passing a host in with the request, setting the
host for the fetch service, or by setting an array of `trustedHosts` that can be either
an array of strings or regexes.

```js
// app/services/fetch.js

import FetchService from 'ember-ajax-fetch/services/fetch';

export default class ExtendedFetchService extends FetchService {
  trustedHosts = [/\.example\./, 'foo.bar.com'];
}
```

### Custom Endpoint Path

The `namespace` property can be used to prefix requests with a specific url namespace.

```js
// app/services/fetch.js

import FetchService from 'ember-ajax-fetch/services/fetch';

export default class ExtendedFetchService extends FetchService {
  namespace = '/api/v1';
}
```

`request('/users/me')` would now target `/api/v1/users/me`

If you need to override the namespace for a custom request, use the `namespace` as an option to the request methods.

```js
// GET /api/legacy/users/me
request('/users/me', { namespace: '/api/legacy' });
```

### Custom Host

`ember-ajax-fetch` allows you to specify a host to be used with a request. This is
especially helpful so you don't have to continually pass in the host along
with the path, makes `request()` a bit cleaner.

To include a custom host to be used with your requests, you can specify `host`
property on the `Fetch Service`.

```js
// app/services/fetch.js

import FetchService from 'ember-ajax-fetch/services/fetch';

export default class ExtendedFetchService extends FetchService {
  host = 'http://api.example.com';
}
```

That allows you to only have to make a call to `request()` as such:

```js
// GET http://api.example.com/users/me
request('/users/me');
```

### Custom Content-Type

`ember-ajax-fetch` allows you to specify a default [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header to be used with a request.

To include a custom Content-Type you can specify `contentType` property on the `Fetch Service`.

```js
// app/services/fetch.js

import FetchService from 'ember-ajax-fetch/services/fetch';

export default class ExtendedFetchService extends FetchService {
  contentType = 'application/json; charset=utf-8';
}
```

You can also override the Content-Type per `request` with the `options` parameter.

### Error handling

`ember-ajax-fetch` provides built in error classes that you can use to check the error
that was returned by the response. This allows you to restrict determination of
error result to the service instead of sprinkling it around your code.

#### Built in error types

`ember-ajax-fetch` has built-in error types that will be returned from the service in the event of an error:

- `BadRequestError` (400)
- `UnauthorizedError`(401)
- `ForbiddenError`(403)
- `NotFoundError` (404)
- `InvalidError`(422)
- `ServerError` (5XX)
- `AbortError`
- `TimeoutError`

All of the above errors are subtypes of `FetchError`.

#### Error detection helpers

`ember-ajax-fetch` uses the helper functions from `ember-fetch` for matching response errors to their respective `ember-ajax-fetch` error type. 
Each of the errors listed above has a corresponding `is*` function (e.g., `isBadRequestResponse`), which can be imported from
`ember-fetch/errors`

Use of these functions is **strongly encouraged** to help eliminate the need for boilerplate error detection code.

```js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  isNotFoundResponse,
  isForbiddenResponse
} from 'ember-fetch/errors'; 
import { isFetchError } from 'ember-ajax-fetch/errors';

export default Route.extend({
  fetch: service(),
  model() {
    return this.fetch.request('/user/doesnotexist').catch(function(error) {
      if (isNotFoundResponse(error)) {
        // handle 404 errors here
        return;
      }

      if (isForbiddenResponse(error)) {
        // handle 403 errors here
        return;
      }

      if (isFetchError(error)) {
        // handle all other AjaxErrors here
        return;
      }

      // other errors are handled elsewhere
      throw error;
    });
  }
});
```

If your errors aren't standard, the helper function for that error type can be used as the base to build your custom detection function.
