import FetchRequest from './fetch-request';

/**
 * Helper function that allows you to use the default `ember-ajax-fetch` to make
 * requests without using the service.
 *
 * @public
 */
export default function request(url, options) {
  const fetch = FetchRequest.create();

  return fetch.request(url, options);
}
