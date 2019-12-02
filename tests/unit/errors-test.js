import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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
  InvalidError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  GoneError,
  BadRequestError,
  ServerError,
  TimeoutError,
  AbortError,
  ConflictError,
  isFetchError
} from 'ember-ajax-fetch/errors';

module('Unit | Errors Test', function(hooks) {
  setupTest(hooks);

  test('FetchError', function(assert) {
    const error = new FetchError();
    assert.ok(error instanceof Error);
  });

  test('InvalidError', function(assert) {
    const error = new InvalidError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof InvalidError);
  });

  test('UnauthorizedError', function(assert) {
    const error = new UnauthorizedError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof UnauthorizedError);
  });

  test('ForbiddenError', function(assert) {
    const error = new ForbiddenError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof ForbiddenError);
  });

  test('NotFoundError', function(assert) {
    const error = new NotFoundError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof NotFoundError);
  });

  test('GoneError', function(assert) {
    const error = new GoneError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof GoneError);
  });

  test('BadRequestError', function(assert) {
    const error = new BadRequestError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof BadRequestError);
  });

  test('ServerError', function(assert) {
    const error = new ServerError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof ServerError);
  });

  test('TimeoutError', function(assert) {
    const error = new TimeoutError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof TimeoutError);
  });

  test('AbortError', function(assert) {
    const error = new AbortError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof AbortError);
  });

  test('ConflictError', function(assert) {
    const error = new ConflictError();
    assert.ok(error instanceof Error);
    assert.ok(error instanceof ConflictError);
  });

  module('isUnauthorizedResponse', function() {
    test('detects error code correctly', function(assert) {
      assert.ok(isUnauthorizedResponse({ status: 401 }));
    });

    test('detects error class correctly', function(assert) {
      const error = new UnauthorizedError();
      assert.ok(isUnauthorizedResponse(error));
    });
  });

  module('isForbiddenResponse', function() {
    test('detects error code correctly', function(assert) {
      assert.ok(isForbiddenResponse({ status: 403 }));
    });

    test('detects error class correctly', function(assert) {
      const error = new ForbiddenError();
      assert.ok(isForbiddenResponse(error));
    });
  });

  module('isNotFoundResponse', function() {
    test(': detects error code correctly', function(assert) {
      assert.ok(isNotFoundResponse({ status: 404 }));
      assert.notOk(isNotFoundResponse({ status: 400 }));
    });

    test('detects error class correctly', function(assert) {
      const error = new NotFoundError();
      const otherError = new Error();
      assert.ok(isNotFoundResponse(error));
      assert.notOk(isNotFoundResponse(otherError));
    });
  });

  module('isGoneResponse', function() {
    test(': detects error code correctly', function(assert) {
      assert.ok(isGoneResponse({ status: 410 }));
      assert.notOk(isGoneResponse({ status: 400 }));
    });

    test('detects error class correctly', function(assert) {
      const error = new GoneError();
      const otherError = new Error();
      assert.ok(isGoneResponse(error));
      assert.notOk(isGoneResponse(otherError));
    });
  });

  module('isInvalidResponse', function() {
    test('detects error code correctly', function(assert) {
      assert.ok(isInvalidResponse({ status: 422 }));
    });


    test('detects error class correctly', function(assert) {
      const error = new InvalidError();
      assert.ok(isInvalidResponse(error));
    });
  });

  module('isBadRequestResponse', function() {
    test('detects error code correctly', function(assert) {
      assert.ok(isBadRequestResponse({ status: 400 }));
    });

    test('detects error class correctly', function(assert) {
      const error = new BadRequestError();
      assert.ok(isBadRequestResponse(error));
    });
  });

  module('isServerErrorResponse', function() {
    test('detects error code correctly', function(assert) {
      assert.notOk(isServerErrorResponse({ status: 499 }), '499 is not a server error');
      assert.ok(isServerErrorResponse({ status: 500 }), '500 is a server error');
      assert.ok(isServerErrorResponse({ status: 599 }), '599 is a server error');
      assert.notOk(isServerErrorResponse({ status: 600 }), '600 is not a server error');
    });
  });

  module('isFetchError', function() {
    test('detects error class correctly', function(assert) {
      const ajaxError = new FetchError();
      const notAjaxError = new Error();
      const ajaxErrorSubtype = new BadRequestError();
      assert.ok(isFetchError(ajaxError));
      assert.notOk(isFetchError(notAjaxError));
      assert.ok(isFetchError(ajaxErrorSubtype));
    });
  });

  module('isAbortError', function() {
    test('detects error class correctly', function(assert) {
      const error = new AbortError();
      assert.ok(isAbortError(error));
    });
  });

  module('isConflictResponse', function() {
    test('detects error code correctly', function(assert) {
      assert.ok(isConflictResponse({ status: 409 }));
    });
  });
});

// describe('unit/errors-test - FetchError', function() {
//
//   test('isTimeoutError: detects error class correctly', function() {
//     const error = new TimeoutError();
//     assert.ok(isTimeoutError(error));
//   });
//
//   describe('isSuccess', function() {
//     test('detects successful request correctly', function() {
//       notOk(isSuccess(100));
//       notOk(isSuccess(199));
//       assert.ok(isSuccess(200));
//       assert.ok(isSuccess(299));
//       notOk(isSuccess(300));
//       assert.ok(isSuccess(304));
//       notOk(isSuccess(400));
//       notOk(isSuccess(500));
//     });
//   });
// });
