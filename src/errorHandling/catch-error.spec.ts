import { catchAsyncError, catchError } from './catch-error';

describe('catchError', () => {
  describe('synchronous errors', () => {
    test('GIVEN no error is thrown THEN should return the result of the function', () => {
      const fn = () => 'success';
      const result = catchError(fn);
      expect(result).toEqual([null, 'success']);
    });

    test('GIVEN an error is thrown THEN should return an error', () => {
      const fn = () => {
        throw new Error('failure');
      };
      const result = catchError(fn);
      expect(result).toEqual([new Error('failure')]);
    });

    test('GIVEN a non-error object is thrown THEN should return a new error', () => {
      const fn = () => {
        throw 'failure';
      };
      const result = catchError(fn);
      expect(result).toEqual([new Error('failure')]);
    });

    test('GIVEN a number is thrown THEN should return a new error', () => {
      const fn = () => {
        throw 123;
      };
      const result = catchError(fn);
      expect(result).toEqual([new Error('123')]);
    });

    test('GIVEN null is thrown THEN should return a new error', () => {
      const fn = () => {
        throw null;
      };
      const result = catchError(fn);
      expect(result).toEqual([new Error('null')]);
    });
  });
});

describe('catchAsyncError', () => {
  describe('asynchronous errors', () => {
    test('GIVEN no error is thrown THEN should return the result of the function', async () => {
      const fn = async () => 'success';
      const result = await catchAsyncError(fn);
      expect(result).toEqual([null, 'success']);
    });

    test('GIVEN an error is thrown THEN should return an error', async () => {
      const fn = async () => {
        throw new Error('failure');
      };
      const result = await catchAsyncError(fn);
      expect(result).toEqual([new Error('failure')]);
    });

    test('GIVEN a non-error object is thrown THEN should return a new error', async () => {
      const fn = async () => {
        throw 'failure';
      };
      const result = await catchAsyncError(fn);
      expect(result).toEqual([new Error('failure')]);
    });

    test('GIVEN a number is thrown THEN should return a new error', async () => {
      const fn = async () => {
        throw 123;
      };
      const result = await catchAsyncError(fn);
      expect(result).toEqual([new Error('123')]);
    });

    test('GIVEN null is thrown THEN should return a new error', async () => {
      const fn = async () => {
        throw null;
      };
      const result = await catchAsyncError(fn);
      expect(result).toEqual([new Error('null')]);
    });
  });
});
