# Emojive Backend
Emojive is a chat room service where you can only use Emojis to communicate.

The goal of this project is to...
1. Practice creating a real-time service using simple http and websocket connections
2. Practice creating a NodeJS project with well defined project structure
3. NodeJS project on a Home Server with limited resources
    > The project is running on a [Dell WYSE N03D Thin Client](https://www.parkytowers.me.uk/thin/wyse/3030/n03d.shtml) running debian
4. Create something interesting with a unique twist

### Current State
The server is able to handle basic WebSocket connections and send messages between clients

### Planned Work

Functional:
- Create chat room sessions which people can either be randomly paired in or connect to with a session id.
- Match people based on their country and language they speak. Preferring to match those who do not share a language.

DevOps:
- Setup continuous deployment to Thin Client server
- Deploy service to a cloud environment (AWS EC2, Azure virtual Machine, Google Cloud Compute Engine, etc.)

Security:
- Authentication on websocket connection


## Setup

### Environment vars
This project uses the following environment variables:

| Name                          | Description                         | Default Value                                  |
| ----------------------------- | ------------------------------------| -----------------------------------------------|
|PORT           | PORT the server listens on            | `8080`      |
|IP           | IP the server listens on            | `localhost`      |


# Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 20.16.0


# Getting started
- Clone the repository
```
git clone  https://github.com/thomasy314/emojive-backend.git 
```
- Install dependencies
```
cd emojive-backend
npm install
```
- Build and run the project
```
npm run start
```

Once running, the server will tell you what ip and port you can access the http and websocket connections through.

## Project Structure
The folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **dist**                 | Contains the distributable (or output) from your TypeScript build.  |
| **node_modules**         | Contains all  npm dependencies                                                            |
| **src**                  | Contains  source code that will be compiled to the dist dir                               |
| **src/config**      | Configuration files for various parts of the application 
| **src/controllers**      | Controllers define functions to serve various http routes and websocket events. 
| **src/routes**           | Contain all http and websocket routes
| **src/types**           | Contains TypeScript type definitions
| **src/utils**           | Contains common utility functions
| **src**/index.ts         | Entry point to http/websocket server                                                               |
| .env           | Environment variable file that developers create to define server behavior (Not included in git repo)
| .gitignore             | Defines folders and files that should not be included in git repo   | 
| LICENSE             | Project use license   | 
| package-lock.json             | Contains specific npm dependency versions    | 
| package.json             | Contains npm dependencies as well as build scripts and project metadata   | 
tsconfig.json            | Config settings for compiling source code only written in TypeScript    

## Building the project

### Running the build
All the different build steps are orchestrated via [npm scripts](https://docs.npmjs.com/misc/scripts).
Npm scripts basically allow us to call (and chain) terminal commands via npm.

| Npm Script | Description |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm start`                   | Runs node on dist/index.js.                  |
| `npm run build`                   | Runs full build and outputs artifacts to `dist` folder      |
