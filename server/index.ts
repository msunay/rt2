import express from 'express';
import cors from 'cors';
import router from './router';
import http from 'http';
import { Server } from 'socket.io';
import peersSocketInit from './controllers/peers.socket.controller';
import quizSocketInit from './controllers/quiz.socket.controller'


const app = express();

const corsOrigin = process.env.NODE_ENV === 'production'
? process.env.CORS_ORIGIN
: 'http://localhost:3000';

const corsOptions = {
  origin: corsOrigin,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

export const server = http.createServer(app);
console.log(process.env.CORS_ORIGIN);

export const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN + ':3001'
    : 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

export const peers = io.of('/mediasoup');

export const quiz = io.of('/quizspace');

peers.on('connection', peersSocketInit);

quiz.on('connection', quizSocketInit);

export default app;
