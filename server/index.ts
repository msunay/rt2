import express from 'express';
import cors from 'cors';
import router from './router';
import http from 'http';
import { Server } from 'socket.io';
import peersSocketInit from './controllers/peers.socket.controller';
import { ClientToServerEvents, ServerToClientEvents } from './PeerSocketTypes';

const app = express();
export const PORT = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(router);

export const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: `http://localhost:3000`,  // TODO .env for prod origin
    methods: ['GET', 'POST'],
  },
});

export const peers = io.of('/mediasoup');

peers.on('connection', peersSocketInit);

export default app;
