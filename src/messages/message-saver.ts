import {
  mongoDBMessageCollection,
  mongoDBName,
} from '../config/mongodb.config';
import createMongoDBConnection from '../db/mongodb';
import kafkaEvents from '../events/kafka';
import createKafkaConsumer from '../events/kafka/kafka.consumer';

async function messageSaver() {
  console.log('Starting Message Saver');

  const MESSAGE_CONNECTOR_GOURP_ID = 'message-connector-group';
  const ALL_TOPIC_REGEX = /^[^_+].*/;

  const kafkaInstance = kafkaEvents.getKafka();
  const consumer = await createKafkaConsumer(
    kafkaInstance,
    MESSAGE_CONNECTOR_GOURP_ID,
    [ALL_TOPIC_REGEX]
  );

  const mongoDB = await createMongoDBConnection(
    mongoDBName,
    mongoDBMessageCollection
  );

  consumer.setEventHandler(message => {
    mongoDB.saveItem({
      _id: message.key,
      value: message.value,
    });
  });
}

export default messageSaver;
