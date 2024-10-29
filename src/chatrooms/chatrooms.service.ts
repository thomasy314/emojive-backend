import { Kafka } from 'kafkajs';
import { EventBusEvent } from '../events/events.types';
import kafkaEvents from '../events/kafka';
import createKafkaAdmin from '../events/kafka/kafka.admin';
import createKafkaLedger from '../events/kafka/kafka.ledger';
import {
  createChatroomQuery,
  createChatroomUserLinkQuery,
  deleteChatroomUserLinkQuery,
} from './db/chatrooms.queries';

function chatroomService(kafka: Kafka, ledger = createKafkaLedger(kafka)) {
  async function createChatroom(
    chatroomName: string,
    isPublic: boolean,
    maxOccupancy: number
  ) {
    const createChatroomResult = await createChatroomQuery(
      chatroomName,
      isPublic,
      maxOccupancy
    );
    const createChatroomData = createChatroomResult.rows[0];

    const eventAdmin = await createKafkaAdmin(kafka);

    eventAdmin.createTopic(createChatroomData.chatroom_uuid, 1);

    return {
      chatroomUUID: createChatroomData.chatroom_uuid,
      chatroomName: createChatroomData.chatroom_name,
      isPublic: createChatroomData.is_public,
      maxOccupancy: createChatroomData.max_occupancy,
    };
  }

  async function joinChatroom(
    chatroomUUID: string,
    userUUID: string,
    onMessage: (message: object) => void
  ) {
    await createChatroomUserLinkQuery(chatroomUUID, userUUID);

    const eventConsumer = await ledger.addConsumer(userUUID, [chatroomUUID]);

    eventConsumer.setEventHandler(message => {
      onMessage(message);
    });

    ledger.addProducer(chatroomUUID);
  }

  async function receiveChatroomMessage(
    chatroomUUID: string,
    userUUID: string,
    message: object
  ): Promise<void> {
    const eventBusMessage: EventBusEvent = {
      key: userUUID,
      value: { message, sender: userUUID },
    };

    ledger.submitEvent(chatroomUUID, eventBusMessage);
  }

  async function leaveChatroom(
    chatroomUUID: string,
    userUUID: string
  ): Promise<void> {
    await deleteChatroomUserLinkQuery(chatroomUUID, userUUID);

    ledger.removeConsumer(userUUID);
    ledger.removeProducer(chatroomUUID);
  }

  return {
    createChatroom,
    joinChatroom,
    leaveChatroom,
    receiveChatroomMessage,
  };
}

export default chatroomService(kafkaEvents.getKafka());
export { chatroomService as createChatroomService };
