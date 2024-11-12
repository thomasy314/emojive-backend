import { mongoClient, mongoDBName } from '../../config/mongodb.config';

async function createMongoConnection(
  dbName: string = mongoDBName,
  collectionName: string
) {
  const mongoConnection = await mongoClient.connect();
  const db = mongoConnection.db(dbName);
  // TODO: Remove below ling when adding functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const collection = db.collection(collectionName);
}

export default createMongoConnection;
