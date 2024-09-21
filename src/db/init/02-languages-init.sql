CREATE TABLE IF NOT EXISTS languages (
    language_id             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    language_code           Text NOT NULL,
    region_code             Text,
    UNIQUE(language_code, region_code)
);