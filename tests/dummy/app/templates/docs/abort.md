# Aborting Requests

Fetch requests can be aborted by utilizing an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
They are not supported in IE11, but we have included a [polyfill](https://www.npmjs.com/package/abortcontroller-polyfill) for IE11, 
so it should catch the error.

## AbortController Example

You will want to create a new `AbortController` and pass it in the options to the `fetch` request.

```js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FooRoute extends Route {
  @service fetch;

  const queryParams = {
    'filter[interval_type]': 'month'
  };
  
  model() { 
    const abortController = new AbortController();
    return this.fetch.request('/foo/bar', {
      abortController,
      data: queryParams
    });
  }
}
```

You can then cancel a request later by using the `AbortController` you created.

```js
abortController.abort();
```
