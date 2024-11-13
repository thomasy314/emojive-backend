import { mongoClient } from '../../config/mongodb.config';

type DocumentDBConnection = {
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

  return {
    saveItem,
  };
}

export default createMongoConnection;
export type { DocumentDBConnection };
