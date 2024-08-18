
type IncomingChat = {
    message: string,
    clientId: string
}

/**
 * Given an incoming chat object, assertIncomingChat confirms if 
 * the object contains the required fields of the IncomingChat type 
 * @param {IncomingChat} incomingChat - Incoming chat data that needs to be confirmed to be a proper IncomingChat type
 * @returns {boolean} 
 */
function assertIncomingChat(incomingChat: IncomingChat): boolean {
    if (!incomingChat.message || !incomingChat.clientId) return false;

    return true;
}

type OutgoingChat = {
    message: string,
    clientId: string
}

export {
    IncomingChat,
    OutgoingChat,
    assertIncomingChat
};

