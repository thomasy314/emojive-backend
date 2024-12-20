import { Kafka } from 'kafkajs';
import { catchAsyncError } from '../errorHandling/catch-error';
import { EventBusEvent, EventConsumerHandler } from '../events/events.types';
import kafkaEvents from '../events/kafka';
import createKafkaAdmin from '../events/kafka/kafka.admin';
import createKafkaLedger from '../events/kafka/kafka.ledger';
import { MessageSchema } from '../messages/messages.schema';
import messagesService from '../messages/messages.service';
import {
  createChatroomQuery,
  createChatroomUserLinkQuery,
  deleteChatroomUserLinkQuery,
  getChatroomUsersQuery,
  getUserChatroomsQuery,
  listChatroomsQuery,
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

  async function joinChatroom(chatroomUUID: string, userUUID: string) {
    await createChatroomUserLinkQuery(chatroomUUID, userUUID);
  }

  async function getChatroomUsers(chatroomUUID: string) {
    const result = await getChatroomUsersQuery(chatroomUUID);
    return result.rows.map(row => row.user_uuid);
  }

  async function getUserChatrooms(userUUID: string) {
    const result = await getUserChatroomsQuery(userUUID);
    return result.rows.map(row => row.chatroom_uuid);
  }

  async function addChatroomMessageReceiver(
    userUUID: string,
    chatroomUUID: string,
    handler: EventConsumerHandler
  ) {
    console.log('Adding chatroom message receiver', userUUID, chatroomUUID);
    ledger.addProducer(chatroomUUID);

    await ledger.addConsumer(userUUID, [chatroomUUID]);

    ledger.registerConsumerHandler(userUUID, handler);
  }

  async function emitChatroomMessage(
    chatroomUUID: string,
    userUUID: string,
    message: MessageSchema
  ): Promise<void> {
    const messageMetadata = {
      chatroomUUID,
      userUUID,
    };
    const processedMessage = await messagesService.processIncomingMessage(
      message,
      messageMetadata
    );

    const eventBusMessage: EventBusEvent = {
      key: crypto.randomUUID(),
      value: {
        message: processedMessage,
        chatroomUUID,
        userUUID,
        timestamp: new Date().toISOString(),
      },
    };

    const [error] = await catchAsyncError(() =>
      ledger.submitEvent(chatroomUUID, eventBusMessage)
    );

    if (error) {
      throw error;
    }
  }

  async function listChatrooms() {
    const result = await listChatroomsQuery();
    const chatrooms = result.rows;

    return chatrooms.map(chatroom => ({
      chatroomUUID: chatroom.chatroom_uuid,
      chatroomName: chatroom.chatroom_name,
      maxOccupancy: chatroom.max_occupancy,
    }));
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
    addChatroomMessageReceiver,
    getChatroomUsers,
    getUserChatrooms,
    leaveChatroom,
    emitChatroomMessage,
    listChatrooms,
  };
}

export default chatroomService(kafkaEvents.getKafka());
export { chatroomService as createChatroomService };
