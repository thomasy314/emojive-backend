CREATE TABLE IF NOT EXISTS users (
    user_id                 BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_uuid               UUID NOT NULL DEFAULT gen_random_uuid(),
    user_name               TEXT NOT NULL,
    creation_timestamp      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_time      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    country                 TEXT NOT NULL,
    country_region          TEXT
);