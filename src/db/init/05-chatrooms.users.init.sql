CREATE TABLE IF NOT EXISTS chatrooms_users (
    user_id             BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    chatroom_id         BIGINT REFERENCES chatrooms(chatroom_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, chatroom_id)
)