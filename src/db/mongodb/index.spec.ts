import { Db } from 'mongodb';
import { mongoClient } from '../../config/mongodb.config';
import { givenRandomString } from '../../utils/test-helpers';
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

  describe('insertItem', () => {
    test('GIVEN valid item THEN should insert the item into the collection', async () => {
      // Setup
      const dbName = 'testDB';
      const collectionName = 'testCollection';
      const item = { name: 'testItem' };
      const insertOneMock = jest
        .fn()
        .mockResolvedValue({ insertedId: '12345' });
      mongoCollectionMock.mockReturnValue({
        insertOne: insertOneMock,
      });

      // Execute
      const connection = await createMongoConnection(dbName, collectionName);
      const result = await connection.saveItem(item);

      // Validate
      expect(insertOneMock).toHaveBeenCalledTimes(1);
      expect(insertOneMock).toHaveBeenCalledWith(item);
      expect(result).toEqual({ insertedId: '12345' });
    });
  });

  describe('getItems', () => {
    test('GIVEN valid query THEN should return the items from the collection', async () => {
      // Setup
      const dbName = givenRandomString();
      const collectionName = givenRandomString();
      const query = { name: givenRandomString() };
      const items = [
        { name: givenRandomString() },
        { name: givenRandomString() },
      ];
      const findMock = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(items),
      });
      mongoCollectionMock.mockReturnValue({
        find: findMock,
      });

      // Execute
      const connection = await createMongoConnection(dbName, collectionName);
      const result = await connection.getItems(query);

      // Validate
      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith(query, undefined);
      expect(result).toEqual(items);
    });

    test('GIVEN no query THEN should return all items from the collection', async () => {
      // Setup
      const dbName = 'testDB';
      const collectionName = 'testCollection';
      const items = [{ name: 'testItem1' }, { name: 'testItem2' }];
      const findMock = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(items),
      });
      mongoCollectionMock.mockReturnValue({
        find: findMock,
      });

      // Execute
      const connection = await createMongoConnection(dbName, collectionName);
      const result = await connection.getItems({});

      // Validate
      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith({}, undefined);
      expect(result).toEqual(items);
    });
  });
});
