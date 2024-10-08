import { Kafka } from 'kafkajs';

function kafkaEvents() {
  let kafkaClient: Kafka | undefined;

  function initKafka(initClient: Kafka) {
    kafkaClient = initClient;
  }

  function getKafka(): Kafka {
    if (kafkaClient === undefined) {
      throw new Error(
        'kafka client is undefined, please initialize with initKafka(kafkaClient: Kafka)'
      );
    }
    return kafkaClient;
  }

  function destroy() {
    kafkaClient = undefined;
  }

  return {
    initKafka,
    getKafka,
    destroy,
  };
}

export default kafkaEvents();
