import { Pool } from 'pg';
import { query, transaction } from './index';

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('db function', () => {
  describe('query', () => {
    test('GIVEN inputs THEN calls db', () => {
      // Setup
      const textInput = 'hello';
      const paramsInput = ['world'];

      const mockedPool = jest.mocked(new Pool());

      // Execute
      query(textInput, paramsInput);

      // Validate
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(textInput, paramsInput);
    });
  });

  describe('transaction', () => {
    test('GIVEN several queries THEN confirms they are called between transaction BEGIN and COMMIT', async () => {
      // Setup
      const queries = [
        jest.fn().mockResolvedValue('hi'),
        jest.fn().mockResolvedValue('bye'),
      ];

      const mockedPool = jest.mocked(new Pool());

      // Execute
      const transactionResponse = await transaction(queries);

      // Validate
      expect(transactionResponse).toStrictEqual(['hi', 'bye']);

      expect(mockedPool.query).toHaveBeenCalledTimes(2);
      expect(mockedPool.query).toHaveBeenNthCalledWith(1, 'BEGIN', undefined);
      expect(mockedPool.query).toHaveBeenNthCalledWith(2, 'COMMIT', undefined);

      queries.forEach(q => expect(q).toHaveBeenCalledTimes(1));

      // Confirm queries occur between transaction BEGIN and COMMIT
      queries
        .flatMap(q => q.mock.invocationCallOrder)
        .forEach(qOrder => {
          // BEGIN
          expect(mockedPool.query.mock.invocationCallOrder[0]).toBeLessThan(
            qOrder
          );
          // COMMIT
          expect(mockedPool.query.mock.invocationCallOrder[1]).toBeGreaterThan(
            qOrder
          );
        });
    });

    test('GIVEN a query within the transaction fails THEN rollback transaction and throw error', async () => {
      // Setup
      const query = jest.fn().mockRejectedValueOnce('THE EVIL!');

      const mockedPool = jest.mocked(new Pool());

      // Execute
      const transactionResponsePromise = transaction([query]);

      // Validate
      transactionResponsePromise.catch(err => {
        expect(err).toBe('THE EVIL!');

        expect(mockedPool.query).toHaveBeenCalledTimes(2);
        expect(mockedPool.query).toHaveBeenNthCalledWith(1, 'BEGIN', undefined);
        expect(mockedPool.query).toHaveBeenNthCalledWith(
          2,
          'ROLLBACK',
          undefined
        );

        expect(query).toHaveBeenCalledTimes(1);
      });
    });
  });
});
