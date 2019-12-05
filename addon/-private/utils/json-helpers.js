/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON, status from the response
 */
export async function parseJSON(response) {
  let error;

  if (!response.ok) {
    const errorBody = await response.text();
    error = {
      message: errorBody,
      status: response.status,
      statusText: response.statusText
    };
  }

  return new Promise((resolve) => {
    return response.json()
      .then((json) => {
        if (response.ok) {
          return resolve({
            status: response.status,
            ok: response.ok,
            json
          });
        } else {
          error = Object.assign({}, json, error);

          return resolve(error);
        }
      })
      .catch((err) => {
        error.message = error.message || err.toString();

        return resolve(error);
      });
  });
}
