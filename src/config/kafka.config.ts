import { logLevel } from 'kafkajs';

const kafkaConfig = {
  clientId: 'emojive',
  brokers: ['kafka_events:9092'],
  logLevel: logLevel.ERROR,
};

export default kafkaConfig;
