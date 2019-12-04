/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON, status from the response
 */
export function parseJSON(response) {
  return new Promise((resolve, reject) => {
    return response.json()
      .then((json) => {
        if (response.ok) {
          return resolve({
            status: response.status,
            ok: response.ok,
            json
          });
        } else {
          const error = Object.assign({}, json, {
            status: response.status,
            statusText: response.statusText
          });

          return reject(error);
        }
      })
      .catch((err) => {
        const error = {
          message: err.toString(),
          status: response.status,
          statusText: response.statusText,
        };

        return reject(error);
      });
  });
}
