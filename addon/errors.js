export class FetchError extends Error {
  constructor(payload, message = 'Ajax operation failed', status) {
    super(message);

    this.payload = payload;
    this.status = status;
  }
}

export class InvalidError extends FetchError {
  constructor(payload) {
    super(payload, 'Request was rejected because it was invalid', 422);
  }
}

export class UnauthorizedError extends FetchError {
  constructor(payload) {
    super(payload, 'Ajax authorization failed', 401);
  }
}

export class ForbiddenError extends FetchError {
  constructor(payload) {
    super(
      payload,
      'Request was rejected because user is not permitted to perform this operation.',
      403,
    );
  }
}

export class BadRequestError extends FetchError {
  constructor(payload) {
    super(payload, 'Request was formatted incorrectly.', 400);
  }
}

export class NotFoundError extends FetchError {
  constructor(payload) {
    super(payload, 'Resource was not found.', 404);
  }
}

export class GoneError extends FetchError {
  constructor(payload) {
    super(payload, 'Resource is no longer available.', 410);
  }
}

export class TimeoutError extends FetchError {
  constructor() {
    super(null, 'The ajax operation timed out', -1);
  }
}

export class AbortError extends FetchError {
  constructor() {
    super(null, 'The ajax operation was aborted', 0);

    this.name = 'AbortError';
  }
}

export class ConflictError extends FetchError {
  constructor(payload) {
    super(payload, 'The ajax operation failed due to a conflict', 409);
  }
}

export class ServerError extends FetchError {
  constructor(payload, status) {
    super(payload, 'Request was rejected due to server error', status);
  }
}

/**
 * Checks if the given error is or inherits from FetchError
 * @function isFetchError
 */
export function isFetchError(error) {
  return error instanceof FetchError;
}

/**
 * Checks if the given object represents a "timeout" error
 * @function isTimeoutError
 */
export function isTimeoutError(error) {
  return error instanceof TimeoutError;
}

/**
 * Checks if the given response represents an unauthorized request error
 * @function isUnauthorizedResponse
 */
export function isUnauthorizedResponse(response) {
  return response.status === 401;
}

/**
 * Checks if the given response represents a forbidden request error
 * @function isForbiddenResponse
 */
export function isForbiddenResponse(response) {
  return response.status === 403;
}

/**
 * Checks if the given response represents an invalid request error
 * @function isInvalidResponse
 */
export function isInvalidResponse(response) {
  return response.status === 422;
}

/**
 * Checks if the given response represents a bad request error
 * @function isBadRequestResponse
 */
export function isBadRequestResponse(response) {
  return response.status === 400;
}

/**
 * Checks if the given response represents a "not found" error
 * @function isNotFoundResponse
 */
export function isNotFoundResponse(response) {
  return response.status === 404;
}

/**
 * Checks if the given response represents a "gone" error
 * @function isGoneResponse
 */
export function isGoneResponse(response) {
  return response.status === 410;
}

/**
 * Checks if the given error is an "abort" error
 * @function isAbortError
 */
export function isAbortError(error) {
  return error.name == 'AbortError';
}

/**
 * Checks if the given response represents a conflict error
 * @function isConflictResponse
 */
export function isConflictResponse(response) {
  return response.status === 409;
}

/**
 * Checks if the given response represents a server error
 * @function isServerErrorResponse
 */
export function isServerErrorResponse(response) {
  return response.status >= 500 && response.status < 600;
}
