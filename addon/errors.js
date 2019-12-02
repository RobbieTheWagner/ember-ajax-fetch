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
      403
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
 */
export function isFetchError(error) {
  return error instanceof FetchError;
}
