
/**
 * Type defining what should be included in websocket chat data
 */
type IncomingChat = {
    message: string
}

/**
 * Given an incoming chat object, assertIncomingChat confirms if 
 * the object contains the required fields of the IncomingChat type 
 * @param {IncomingChat} incomingChat incoming chat data that needs to be confirmed to be a proper IncomingChat type
 * @returns {boolean} 
 */
function assertIncomingChat(incomingChat: IncomingChat): boolean {
    if (!incomingChat.message) return false;

    return true;
}

type OutgoingChat = {
    message: string
}

export {
    IncomingChat,
    OutgoingChat,
    assertIncomingChat
};

