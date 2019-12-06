# Usage

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

## Extending the service

You may want to import the fetch service and extend it, to set things like `namespace` and
`host` on every request.
