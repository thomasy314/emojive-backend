CREATE TABLE IF NOT EXISTS users_languages (
    user_id             BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    language_id         BIGINT REFERENCES languages(language_id) ON DELETE RESTRICT,
    PRIMARY KEY (user_id, language_id)
);