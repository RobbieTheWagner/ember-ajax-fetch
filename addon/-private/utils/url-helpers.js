const completeUrlRegex = /^(http|https)/;

/**
 * Parse a URL string into an object that defines its structure
 *
 * The returned object will have the following properties:
 *
 *   href: the full URL
 *   protocol: the request protocol
 *   hostname: the target for the request
 *   port: the port for the request
 *   pathname: any URL after the host
 *   search: query parameters
 *   hash: the URL hash
 *
 * @param {string} str
 * @function parseURL
 * @private
 */
export function parseURL(str) {
  let fullObject;

  if (typeof FastBoot === 'undefined') {
    const element = document.createElement('a');
    element.href = str;
    fullObject = element;
  } else {
    fullObject = FastBoot.require('url').parse(str);
  }

  const desiredProps = {
    href: fullObject.href,
    protocol: fullObject.protocol,
    hostname: fullObject.hostname,
    port: fullObject.port,
    pathname: fullObject.pathname,
    search: fullObject.search,
    hash: fullObject.hash,
  };

  return desiredProps;
}

/**
 * Returns true if both `a` and `b` have the same protocol, hostname, and port.
 * @param {string} a
 * @param {string} b
 * @return {boolean}
 * @function haveSameHost
 * @private
 */
export function haveSameHost(a, b) {
  const urlA = parseURL(a);
  const urlB = parseURL(b);

  return (
    urlA.protocol === urlB.protocol &&
    urlA.hostname === urlB.hostname &&
    urlA.port === urlB.port
  );
}

/**
 * Checks if the URL is already a full URL
 * @param {string} url
 * @return {boolean}
 * @function isFullURL
 * @private
 */
export function isFullURL(url) {
  return !!url.match(completeUrlRegex);
}

/**
 * Checks if the given string starts with '/'
 * @param {string} string The string to check
 * @return {boolean}
 * @function startsWithSlash
 * @private
 */
export function startsWithSlash(string) {
  return string.charAt(0) === '/';
}

/**
 * Checks if the given string ends with '/'
 * @param {string} string The string to check
 * @return {boolean}
 * @function endsWithSlash
 * @private
 */
export function endsWithSlash(string) {
  return string.charAt(string.length - 1) === '/';
}

/**
 * Remove a leading slash from the given string
 * @param {string} string The string to remove the slash from
 * @return {string}
 * @function removeLeadingSlash
 * @private
 */
export function removeLeadingSlash(string) {
  return string.substring(1);
}

/**
 * Remove a trailing slash from the given string
 * @param {string} string The string to remove the slash from
 * @return {string}
 * @function removeTrailingSlash
 * @private
 */
export function removeTrailingSlash(string) {
  return string.slice(0, -1);
}

/**
 * Strip slashes from the given path
 * @param {string} path The path to remove slashes from
 * @return {string}
 * @function stripSlashes
 * @private
 */
export function stripSlashes(path) {
  // make sure path starts with `/`
  if (startsWithSlash(path)) {
    path = removeLeadingSlash(path);
  }

  // remove end `/`
  if (endsWithSlash(path)) {
    path = removeTrailingSlash(path);
  }
  return path;
}
