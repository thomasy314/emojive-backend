import express, { Express } from 'express';

const expressServer: Express = express();

expressServer.get('/', (req, res) => {
  console.log('Connection');
  res.send('You GOT it!');
});

export default expressServer;
