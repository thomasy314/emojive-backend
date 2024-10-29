import { Kafka } from 'kafkajs';
import kafkaConfig from '../../config/kafka.config';

function kafkaEvents(kafkaClient: Kafka) {
  function getKafka(): Kafka {
    return kafkaClient;
  }

  return {
    getKafka,
  };
}

export default kafkaEvents(new Kafka(kafkaConfig));
export { kafkaEvents as createKafkaEvents };
