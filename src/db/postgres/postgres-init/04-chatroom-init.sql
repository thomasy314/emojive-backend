CREATE TABLE IF NOT EXISTS chatrooms (
    chatroom_id             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    chatroom_uuid           UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    chatroom_name           Text,
    creation_timestamp      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_public               BOOLEAN NOT NULL,
    max_occupancy           SMALLINT NOT NULL
)