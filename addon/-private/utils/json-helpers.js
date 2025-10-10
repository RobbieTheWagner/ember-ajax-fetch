import { COMPRESSED_TYPES } from '../constants/response';

/**
 * Determine if a string is JSON or not
 * @param {string} str The string to check for JSON formatting
 * @return {boolean}
 * @function isJsonString
 * @private
 */
export function isJsonString(str) {
  try {
    const json = JSON.parse(str);
    return typeof json === 'object';
  } catch (e) {
    return false;
  }
}

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 * @return {object} The parsed JSON, status from the response
 * @function parseJSON
 * @private
 */
export async function parseJSON(response) {
  // Generate unique ID for this request trace
  const traceId = `parseJSON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[DEBUG] ${traceId}: Starting response parsing`);
  console.log(`[DEBUG] ${traceId}: Response object:`, response);
  console.log(`[DEBUG] ${traceId}: Response.ok =`, response.ok);
  console.log(`[DEBUG] ${traceId}: Response.status =`, response.status);
  console.log(`[DEBUG] ${traceId}: Response.statusText =`, response.statusText);
  console.log(`[DEBUG] ${traceId}: Response.type =`, response.type);
  console.log(`[DEBUG] ${traceId}: Response.url =`, response.url);
  console.log(`[DEBUG] ${traceId}: Response.headers =`, response.headers);
  console.log(
    `[DEBUG] ${traceId}: Content-Type header =`,
    response.headers.get('content-type'),
  );

  const responseType =
    response.headers.get('content-type') || 'Empty Content-Type';
  console.log(`[DEBUG] ${traceId}: Determined response type =`, responseType);

  let error = {
    status: response.status,
    statusText: response.statusText,
  };

  if (!response.ok) {
    const errorBody = await response.text();
    console.log(`[DEBUG] ${traceId}: Non-OK response error body =`, errorBody);
    error.message = errorBody;
  }

  return new Promise((resolve) => {
    if (responseType.includes('json')) {
      console.log(`[DEBUG] ${traceId}: Processing JSON response`);
      return response
        .json()
        .then((json) => {
          console.log(
            `[DEBUG] ${traceId}: JSON parsing successful, data =`,
            JSON.stringify(json),
          );
          if (response.ok) {
            console.log(
              `[DEBUG] ${traceId}: Resolving successful JSON response`,
            );
            return resolve({
              status: response.status,
              ok: response.ok,
              json,
            });
          } else {
            console.log(`[DEBUG] ${traceId}: Resolving failed JSON response`);
            error = Object.assign({}, json, error);
            console.log(`[DEBUG] ${traceId}: Final error object =`, error);

            return resolve(error);
          }
        })
        .catch((err) => {
          console.log(
            `[DEBUG] ${traceId}: JSON parsing failed, error =`,
            err.message,
          );
          if (isJsonString(error.message)) {
            error.payload = JSON.parse(error.message);
          } else {
            error.payload = error.message || err.toString();
          }

          error.message = error.message || err.toString();

          return resolve(error);
        });
    } else if (COMPRESSED_TYPES.includes(responseType)) {
      console.log(`[DEBUG] ${traceId}: Processing compressed response`);
      return response
        .blob()
        .then((blob) => {
          console.log(
            `[DEBUG] ${traceId}: Blob processing successful, size =`,
            blob.size,
          );
          return resolve({
            status: response.status,
            ok: response.ok,
            blob,
          });
        })
        .catch((err) => {
          console.log(
            `[DEBUG] ${traceId}: Blob processing failed, error =`,
            err.message,
          );
          handleError(error, err, traceId);

          return resolve(error);
        });
    } else {
      console.log(`[DEBUG] ${traceId}: Processing text response`);
      return response
        .text()
        .then((text) => {
          console.log(
            `[DEBUG] ${traceId}: Text processing successful, length =`,
            text.length,
          );
          return resolve({
            status: response.status,
            ok: response.ok,
            text,
          });
        })
        .catch((err) => {
          console.log(
            `[DEBUG] ${traceId}: Text processing failed, error =`,
            err.message,
          );
          handleError(error, err, traceId);

          return resolve(error);
        });
    }
  });
}

// Helper function to handle JSON parsing errors
function handleError(error, err, traceId) {
  console.log(
    `[DEBUG] ${traceId}: handleError: Processing error, original error =`,
    error,
    'caught error =',
    err,
  );
  if (isJsonString(error.message)) {
    error.payload = JSON.parse(error.message);
    console.log(
      `[DEBUG] ${traceId}: handleError: Parsed JSON payload =`,
      error.payload,
    );
  } else {
    error.payload = error.message || err.toString();
    console.log(
      `[DEBUG] ${traceId}: handleError: Non-JSON payload =`,
      error.payload,
    );
  }
  error.message = error.message || err.toString();
  console.log(
    `[DEBUG] ${traceId}: handleError: Final processed error =`,
    error,
  );
}
