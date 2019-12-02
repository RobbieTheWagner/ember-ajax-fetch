import Service from '@ember/service';
import { get } from '@ember/object';
import fetch from 'fetch';
import {
  isAbortError,
  isBadRequestResponse,
  isConflictResponse,
  isForbiddenResponse,
  isGoneResponse,
  isInvalidResponse,
  isNotFoundResponse,
  isServerErrorResponse,
  isUnauthorizedResponse
} from 'ember-fetch/errors';
import {
  FetchError,
  UnauthorizedError,
  InvalidError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  GoneError,
  AbortError,
  ConflictError,
  ServerError
} from 'ember-ajax-fetch/errors';
import param from 'jquery-param';

/**
 * @class FetchService
 */
export default class FetchService extends Service {
  /**
   * The default value for the request `contentType`
   *
   * For now, defaults to the same value that jQuery would assign.  In the
   * future, the default value will be for JSON requests.
   * @property {string} contentType
   * @public
   */
  contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
  method = 'GET';

  /**
   * @method request
   * @param {string} url
   * @param {object} options
   * @return {Promise<*>}
   */
  async request(url, options = {}) {
    const requestOptions = {
      method: options.method || this.method,
      headers: {
        'Content-Type': options.contentType || this.contentType,
        ...(this.headers || {}),
        ...(options.headers || {})
      }
    };

    let builtURL = this._buildURL(url, options);
    if (options.data) {
      let { data } = options;

      if (isJsonString(data)) {
        data = JSON.parse(data);
      }

      if (requestOptions.method === 'GET') {
        builtURL = `${builtURL}?${param(data)}`;
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(builtURL, requestOptions);

      return this._handleResponse(response, requestOptions, builtURL);
    } catch (error) {
      // TODO: do we want to just throw here or should some errors be okay?
      throw error;
    }
  }

  /**
   * Generates a detailed ("friendly") error message, with plenty
   * of information for debugging (good luck!)
   */
  generateDetailedMessage(
    status,
    payload,
    contentType,
    type,
    url
  ) {
    let shortenedPayload;
    const payloadContentType =
      contentType || 'Empty Content-Type';

    if (
      payloadContentType.toLowerCase() === 'text/html' &&
      payload.length > 250
    ) {
      shortenedPayload = '[Omitted Lengthy HTML]';
    } else {
      shortenedPayload = JSON.stringify(payload);
    }

    const requestDescription = `${type} ${url}`;
    const payloadDescription = `Payload (${payloadContentType})`;

    return [
      `Ember Fetch Extended Request ${requestDescription} returned a ${status}`,
      payloadDescription,
      shortenedPayload
    ].join('\n');
  }

  /**
   * Build the URL to pass to `fetch`
   * @param {string} url The base url
   * @param {object} options The options to pass to fetch, query params, headers, etc
   * @return {string} The built url
   * @private
   */
  _buildURL(url, options) {
    const urlParts = [];

    let host = options.host || get(this, 'host');
    if (host) {
      host = stripSlashes(host);
    }
    urlParts.push(host);

    let namespace = options.namespace || get(this, 'namespace');
    if (namespace) {
      namespace = stripSlashes(namespace);
      urlParts.push(namespace);
    }

    // *Only* remove a leading slash -- we need to maintain a trailing slash for
    // APIs that differentiate between it being and not being present
    if (startsWithSlash(url)) {
      url = removeLeadingSlash(url);
    }
    urlParts.push(url);

    return urlParts.join('/');
  }

  /**
   * Return the correct error type
   * @param response The response from the fetch call
   * @param payload The response.json() payload
   * @param {object} requestOptions The options object containing headers, method, etc
   * @param {string} url The url string
   * @private
   */
  _createCorrectError(response, payload, requestOptions, url) {
    let error;

    if (isUnauthorizedResponse(response)) {
      error = new UnauthorizedError(payload);
    } else if (isForbiddenResponse(response)) {
      error = new ForbiddenError(payload);
    } else if (isInvalidResponse(response)) {
      error = new InvalidError(payload);
    } else if (isBadRequestResponse(response)) {
      error = new BadRequestError(payload);
    } else if (isNotFoundResponse(response)) {
      error = new NotFoundError(payload);
    } else if (isGoneResponse(response)) {
      error = new GoneError(payload);
    } else if (isAbortError(response)) {
      error = new AbortError();
    } else if (isConflictResponse(response)) {
      error = new ConflictError(payload);
    } else if (isServerErrorResponse(response)) {
      error = new ServerError(payload, response.status);
    } else {
      const detailedMessage = this.generateDetailedMessage(
        response.status,
        payload,
        requestOptions.headers['Content-Type'],
        requestOptions.method,
        url
      );

      error = new FetchError(payload, detailedMessage, response.status);
    }

    return error;
  }

  /**
   * Return the response or handle the error
   * @param response
   * @param {object} requestOptions The options object containing headers, method, etc
   * @param {string} url The url for the request
   * @return {*}
   * @private
   */
  _handleResponse(response, requestOptions, url) {
    const payload = response.json();
    if (response.ok) {
      return payload;
    } else {
      throw this._createCorrectError(response, payload, requestOptions, url);
    }
  }
}

function isJsonString(str) {
  try {
    const json = JSON.parse(str);
    return (typeof json === 'object');
  } catch (e) {
    return false;
  }
}

function startsWithSlash(string) {
  return string.charAt(0) === '/';
}

function endsWithSlash(string) {
  return string.charAt(string.length - 1) === '/';
}

function removeLeadingSlash(string) {
  return string.substring(1);
}

function stripSlashes(path) {
  // make sure path starts with `/`
  if (startsWithSlash(path)) {
    path = removeLeadingSlash(path);
  }

  // remove end `/`
  if (endsWithSlash(path)) {
    path = path.slice(0, -1);
  }
  return path;
}
