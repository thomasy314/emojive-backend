import { MongoClient } from 'mongodb';

const mongoUrl = `mongodb://${process.env.MONGODB_ROOT_USER}:${process.env.MONGODB_ROOT_PASSWORD}@mongo_db:${process.env.MONGODB_PORT}/`;
const mongoClient = new MongoClient(mongoUrl);
const mongoDBName = process.env.MONGODB_DATABASE ?? 'emojive_document_db';
const mongoDBMessageCollection =
  process.env.MONGODB_MESSAGE_COLLECTION ?? 'messages';

export { mongoClient, mongoDBMessageCollection, mongoDBName };
