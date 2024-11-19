import { mongoClient } from '../../config/mongodb.config';

type DocumentDBConnection = {
  getItems: <T>(query: object, options?: object) => Promise<T[]>;
  saveItem: (item: object) => Promise<unknown>;
};

async function createMongoConnection(
  dbName: string,
  collectionName: string
): Promise<DocumentDBConnection> {
  const mongoConnection = await mongoClient.connect();
  const db = mongoConnection.db(dbName);
  const collection = db.collection(collectionName);

  function saveItem(item: object) {
    return collection.insertOne(item);
  }

  function getItems<T>(query: object, options?: object): Promise<T[]> {
    return collection
      .find(query, options)
      .toArray()
      .then(items => items as T[]);
  }

  return {
    getItems,
    saveItem,
  };
}

export default createMongoConnection;
export type { DocumentDBConnection };
