# Emojive Backend

Emojive is a unique chat service where communication is exclusively through emojis. Users can either join or create a known chatroom or be randomly paired with another user. The random pairing feature is designed to connect people from different parts of the world, especially those who don't share a common language, fostering a universal and visually expressive form of communication.

The full initial design doc for Emojive can be found [here](https://orchid-raft-257.notion.site/Emojive-2b8af8f7d1d1465f9149a1baa3523b8e?pvs=4)

The frontend portion of this project is located in the [emojive-frontend](https://github.com/thomasy314/emojive-frontend) repository.

# Setup

## Environment Variables

| Name              | Description                                   | Default Value |
| ----------------- | --------------------------------------------- | ------------- |
| PORT              | PORT the server listens on                    | `3000`        |
| IP                | IP the server listens on                      | `localhost`   |
| POSTGRES_USER     | Username used to connect to PostgreSQL server |               |
| POSTGRES_PASSWORD | Password used to connect to PostgreSQL server |               |
| POSTGRES_DB       | Name given to Emojive PostreSQL database      | `emojive_db`  |
| POSTGRES_PORT     | PORT PostgreSQL listens on                    | `5432`        |
| KAFKA_LOG_LEVEL   | Name given to kafka brokers                   | `2` (error)   |

## Prerequisites

- [Docker](https://docs.docker.com/engine/install/) 27
- Clone this Repo:

```bash
git clone  https://github.com/thomasy314/emojive-backend.git
```

### Development

- [Node.js](https://nodejs.org/en/) version 20

## Deployment

To deploy the Emojive Backend service you will only need to build and spin up the prod docker image:

```bash
npm run docker:prod:deploy
```

This command will create all the necessary infrastructure and start the server. It will also listen for changes to the [Emojive backend docker registry](https://hub.docker.com/repository/docker/thomasy314/emojive-backend/general) and auto deploy new images using [Watchtower](https://hub.docker.com/repository/docker/thomasy314/emojive-backend/general).

## Development

The following steps will spin up the docker development environment and all necessary infrastructure:

Run the following to deploy docker dev environment which hot loads changes:

```bash
npm run docker:dev

# if you want to force docker to re-build the Emojive image

npm run docker:dev:build
```

## Usage/Auth

On startup, the service will display the IP address and port it is listening on. Before making any further requests, a user UUID must be obtained using the `/user/create` API. This UUID should then be included as the `userUUID` URL parameter in subsequent requests.

Below is an example of creating a user for a server running on `localhost` at port `7000`:

```bash
curl    --location '127.0.0.1:7000/user/create' \
        --header 'Content-Type: application/json' \
        --data '{
            "userName": "👨‍🍳",
            "languages": ["EN"],
            "countryCode": "US",
            "countryRegion": "WA"
        }'
```

# Project Structure

The following shows the general folder structure for the project.

```
📦
├─ .github
│  └─ workflows
├─ docs
├─ src
│  ├─ auth
│  ├─ config
│  ├─ db
│  │  └─ init
│  ├─ errorHandling
│  ├─ events
│  ├─ middleware
│  ├─ routes
│  ├─ utils
│  ├─ websocket
│  └─ [feature]
│     ├─ db
│     └─ validation
|   ...
```

- `.github/workflow` - contains [Github Actions](https://docs.github.com/en/actions) CI/CD workflows
- `docs` - Additional documentation not included in README
- `src` - Files used to build node assets
  - `auth` - Authentication server in charge of checking user privledges for API and WebSocket calls
  - `config` - Emojive service configuration files
  - `db` - Feature agnostic files used for db connection, management, querying, etc.
    - `init` - SQL files that are executed after docker initialized the PostgreSQL database. For example, to create all needed database tables
  - `errorHandling` - Error handler helper functions
  - `events` - Event stream interfaces and implementation using Kafka
  - `middleware` - Feature agnostic middleware features
  - `routes` - Feature agnostic routing and HTTP/WebSocket server configuration
  - `utils` - Utility functions used across the package with no specific feature or part associated with it.
  - `websocket` - WebSocket libraty used to handle incoming websocket requests and messages using a middleware pattern similar to [ExpressJS](https://expressjs.com/en/guide/using-middleware.html).
  - `[Feature]` - Feature specific files that will organized by feature including: chatrooms, languages, messages, and users.

for more detailed information about file structure see [File Structure Guidelines](docs/file-structure-guidelines.md).

## Current State

### Auth

- There is a basic auth which requires clients to create a user and use the returned UUID for future requests.

### DevOps

- **CI/CD:** Continuous integration and deployment have been setup using [Github Actions](https://docs.github.com/en/actions) and [Docker](https://www.docker.com/)
  - **Linting:** [ESLint](https://eslint.org/)
  - **Code Formatting:** [Prettier](https://prettier.io/)
  - **Unit Testing/Coverage:** [Jest](https://jestjs.io/)

### Infrastructure

- **API Server:** Server which handles incoming HTTP requests
- **Docker:** Container service used to deploy Emojive and dependent resources
  - **[WatchTower](https://containrrr.dev/watchtower/):** Container-based solution to automatically deploy changes in docker registry.
- **Kafka:** Event pub/sub stream which chatroom servers use to communicate incoming and outgoing messages with each other.
- **PostgreSQL:** Database which stores data for control plane requests

<u>**API Handling**</u>

- **Data validation**: [Ajv](https://ajv.js.org/)

## APIs

### Authorization

Authorization is handled by providing a UserUUID to show that you have registered with the Emojive service. User the `Create User` API to obtain a user UUID. For APIs that require auth, use the `Authorization` header with value `Token [UserUUID]`.

header example:

`Authorization : Token 15bc2d4c-2f2b-4902-8d4a-5d617335cdeb`

### User APIs

#### <ins>Create User</ins>

Creates a new users, returning user UUID which is used as the auth token.

**URL:** `/user/create`

**Method:** `POST`

**Auth Required:** NO

**Body**

<ins>userName</ins> - _string (emoji)_ : User name displayed to other users. Can only be a [unicode emoji](https://unicode.org/emoji/charts/full-emoji-list.html).

<ins>languages</ins> - _string[] (IETF Language Tag)_ : Languages the user can speak and/or read. Must be an [IETF language tag](https://www.w3.org/International/articles/language-tags/).

<ins>countryCode</ins> - _string (ISO 3166)_ : Country the user is from. Must be an [ISO 3166 country code](https://en.wikipedia.org/wiki/ISO_3166-1).

<ins>Example</ins>

```
{
    "userName": "🤷‍♂️",
    "languages": ["en"],
    "countryCode": "US"
}
```

### Chatroom APIs

#### <ins>Create Chatroom</ins>

Creates new chatroom users can then join to communicate in.

**URL:** `/chatroom/create`

**Method:** `POST`

**Auth Required:** YES

**Body**

<ins>chatroomName</ins> - _string (emoji)_ : Chatroom name displayed to other users. Can only be a [unicode emoji](https://unicode.org/emoji/charts/full-emoji-list.html).

<ins>isPublic</ins> - _boolean_ : Can other users search for and see this room?

<ins>maxOccupancy</ins> - _int_ : The maximum number of users that can join a single chatroom

<ins>Example</ins>

```
{
    "chatroomName": "🌊",
    "isPublic": true,
    "maxOccupancy": 2
}
```

#### <ins>Join Chatroom - WebSocket</ins>

Allows users to join a chatroom, also establishing a websocket connection to send messages to and from the chatroom servers.

**URL:** `/chatroom`

**Method:** `WEBSOCKET`

**Auth Required:** YES

**URL Parameters:**

<ins>chatroomUUID</ins> - _string (UUID)_ : The UUID of the chatroom the user is joining

**Example**

```
/chatroom?chatroomUUID=9b2e0258-d6db-4a6f-97a6-e2204776eb01
```

#### <ins>Send Chatroom Message - WebSocket</ins>

Once connected using the `Join Chatroom` websocket api above, the user can send messages to and from the server. The body of the messages must follow one of the following formats.

**Chat Message**

<ins>messageType</ins> - _string_ : Must be set to `chat`
<ins>messageText</ins> - _string (emoji)_ : Message being sent to the chatroom. Can only be a [unicode emoji](https://unicode.org/emoji/charts/full-emoji-list.html).

<ins>Example</ins>

```
{
    "messageType": "chat",
    "messageText": "🌊🛤️"
}
```

## Planned Work

The following is a high level list of items that need implementing, for more detail see [design doc](https://orchid-raft-257.notion.site/Emojive-2b8af8f7d1d1465f9149a1baa3523b8e?pvs=4).

1. Finish Control Plane APIs
   1. user, chatroom, language, etc. APIs
   1. APIS
      1. chatrooms
         1. `listChatrooms`
         1. `getChatroomMessages` - possibly don't need depending on how Kafka config is done
      1. emojis
         1. `getEmojis` - Gets a list of emojis available to users
1. WebSocket messages
   1. Schema
   1. MongoDB - saving messages from kafka [[link](https://www.mongodb.com/docs/kafka-connector/current/)]
1. Integration Tests
