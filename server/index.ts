import express from 'express';
import cors from 'cors';
import router from './router';
import http from 'http';
import { Server } from 'socket.io';
import peersSocketInit from './controllers/peers.socket.controller';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from './Types/PeerSocketTypes';

const app = express();
export const PORT = process.env.SERVER_PORT || 3001;

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGIN
      : 'http://localhost:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

export const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: `http://localhost:3000`, // TODO .env for prod origin
    methods: ['GET', 'POST'],
  },
});

export const peers = io.of('/mediasoup');

peers.on('connection', peersSocketInit);

export default app;
