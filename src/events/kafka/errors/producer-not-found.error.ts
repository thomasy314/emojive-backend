class ProducerNotFoundError extends Error {
  constructor(topic: string) {
    super(`Producer for topic ${topic} not found`);
  }
}

export default ProducerNotFoundError;
