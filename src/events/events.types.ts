interface EventAdmin {
  createTopic: (topic: string, numPartitions: number) => Promise<void>;
  destroy: () => Promise<void>;
}

type EventConsumerHandler = (eventMessage: EventBusEvent) => void;

interface EventConsumer {
  setEventHandler: (eventHandler: EventConsumerHandler) => Promise<void>;
  destroy: () => Promise<void>;
}

interface EventBusEvent {
  key: string;
  value: object | null;
}

interface EventProducer {
  sendMessage: (...events: EventBusEvent[]) => Promise<void>;
  destroy: () => Promise<void>;
}

export type {
  EventAdmin,
  EventBusEvent,
  EventConsumer,
  EventConsumerHandler,
  EventProducer,
};
