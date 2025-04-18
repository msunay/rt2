import express from 'express';
import cors from 'cors';
import router from '@/router';
import http from 'http';
import { Namespace, Server } from 'socket.io';
import peersSocketInit from '@/controllers/peers.socket.controller';
import quizSocketInit from '@/controllers/quiz.socket.controller';
import {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from '@/Types/PeerSocketTypes';
import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '@/Types/QuizSocketTypes';
import { instrument } from '@socket.io/admin-ui';

const app = express();

const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:8081';

const corsOptions = {
  // origin: '*',
  origin: [corsOrigin!, "https://admin.socket.io"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
app.use(cors());
// app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

export const server = http.createServer(app);

export const io = new Server(server, {
  // cors: {
  //   origin:
  //     [corsOrigin!, "https://admin.socket.io", '*'],
  //   methods: ['GET', 'POST'],
  //   credentials: true,
  // },
});

export const peersNamespace: Namespace<PeersServerToClientEvents, PeersClientToServerEvents> =
  io.of('/mediasoup');

export const quizNamespace: Namespace<QuizServerToClientEvents, QuizClientToServerEvents> =
  io.of('/quizspace');

peersNamespace.on('connection', peersSocketInit);

quizNamespace.on('connection', quizSocketInit);

instrument(io, { auth: false, mode: 'development' })

export default app;
