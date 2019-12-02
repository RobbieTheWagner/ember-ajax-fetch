ember-ajax-fetch
==============================================================================

This addon provides a `fetch` service that is meant to have the same API as 
[ember-ajax](https://github.com/ember-cli/ember-ajax). It should be a drop in replacement
when it is finished, and already handles a lot of things!


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.4 or above
* Ember CLI v2.13 or above
* Node.js v8 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-ajax-fetch
```


Usage
------------------------------------------------------------------------------

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


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
