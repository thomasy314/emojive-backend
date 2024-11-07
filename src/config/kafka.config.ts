import { logLevel as kafkaLogLevel } from 'kafkajs';

// Default log level is 1 (ERROR)
const logLevel: kafkaLogLevel = parseInt(
  process.env.KAFKA_LOG_LEVEL ?? '1'
) as kafkaLogLevel;

const kafkaConfig = {
  clientId: 'emojive_events',
  brokers: ['kafka_events:9092'],
  logLevel: logLevel,
};

export default kafkaConfig;
