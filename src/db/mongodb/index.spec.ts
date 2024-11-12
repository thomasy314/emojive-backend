import { Db } from 'mongodb';
import { mongoClient } from '../../config/mongodb.config';
import createMongoConnection from './index';

jest.mock('mongodb');
jest.mock('../../config/mongodb.config');

describe('MongoDB', () => {
  const mongoClientMock = jest.mocked(mongoClient);
  const mongoCollectionMock = jest.fn();
  const mongoDbMock: Db = {
    collection: mongoCollectionMock,
  } as unknown as Db;

  beforeEach(() => {
    mongoClientMock.connect.mockResolvedValue(mongoClientMock);
    mongoClientMock.db.mockReturnValue(mongoDbMock);
  });

  describe('createMongoConnection', () => {
    test('GIVEN valid dbName and collectionName THEN should create a connection and return an object with addDocument function', async () => {
      // Setup
      const dbName = 'testDB';
      const collectionName = 'testCollection';

      // Execute
      await createMongoConnection(dbName, collectionName);

      // Validate
      expect(mongoClientMock.connect).toHaveBeenCalledTimes(1);

      expect(mongoClientMock.db).toHaveBeenCalledTimes(1);
      expect(mongoClientMock.db).toHaveBeenCalledWith(dbName);

      expect(mongoDbMock.collection).toHaveBeenCalledTimes(1);
      expect(mongoDbMock.collection).toHaveBeenCalledWith(collectionName);
    });
  });
});
