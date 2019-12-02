const completeUrlRegex = /^(http|https)/;

/**
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isFullURL(url) {
  return !!url.match(completeUrlRegex);
}
