import express from 'express';
import cors from 'cors';
import router from './router';
import http from 'http';
import { Namespace, Server } from 'socket.io';
import peersSocketInit from './controllers/peers.socket.controller';
import quizSocketInit from './controllers/quiz.socket.controller';
import {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from './Types/PeerSocketTypes';
import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from './Types/QuizSocketTypes';

const app = express();

const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:8081';

const corsOptions = {
  origin: corsOrigin,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
app.use(cors());
// app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN
        : 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

export const peers: Namespace<PeersServerToClientEvents, PeersClientToServerEvents> =
  io.of('/mediasoup');

export const quiz: Namespace<QuizServerToClientEvents, QuizClientToServerEvents> =
  io.of('/quizspace');

peers.on('connection', peersSocketInit);

quiz.on('connection', quizSocketInit);

export default app;
