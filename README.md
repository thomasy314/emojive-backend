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
| POSTGRES_DB       | Name given to Emojive PostreSQL database      |               |

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
├─ src
│  ├─ config
│  ├─ db
│  │  └─ init
│  ├─ middleware
│  ├─ routes
│  └─ [feature]
│     ├─ db
│     └─ validation
|   ...
```

- `.github/workflow` - contains [Github Actions](https://docs.github.com/en/actions) CI/CD workflows
- `src` - Files used to build node assets
  - `config` - Emojive service configuration files
  - `db` - Feature agnostic files used for db connection, management, querying, etc.
    - `init` - SQL files that are executed after docker initialized the PostgreSQL database. For example, to create all needed database tables
  - `middleware` - Feature agnostic middleware features
  - `routes` - Feature agnostic routing and HTTP/WebSocket server configuration
  - `[Feature]` - Feature specific files that will organized by feature (i.e. users, chatrooms, messages, etc.)

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
- **PostgreSQL:** Database which stores data for control plane requests

### APIs

- `/user`
  - `POST /create` - creates a new user and returns the stored user data along with a generated UUID used for authentication.
- `/chatroom`
  - `POST /create` - creates a new chatroom and returns the stored user data along with a generated UUID used for authentication.

<u>**API Handling**</u>

- **Data validation**: [Ajv](https://ajv.js.org/)

## Planned Work

The following is a high level list of items that need implementing, for more detail see [design doc](https://orchid-raft-257.notion.site/Emojive-2b8af8f7d1d1465f9149a1baa3523b8e?pvs=4).

1. Finish Control Plane APIs
   1. user, chatroom, language, etc. APIs
   1. Country and Region Codes [ISO 3166](https://www.iso.org/iso-3166-country-codes.html)
1. WebSocket messages
   1. Sending/Receiving
   1. Schema
   1. Kafka messages queue
   1. MongoDB
1. Integration Tests
