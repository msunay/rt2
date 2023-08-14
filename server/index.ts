import express from "express";
import cors from "cors";
import router from "./router";
import http from 'http';
import https from 'https';
import { Server, Socket } from "socket.io";
import peersSocketInit from "./controllers/peers.socket.controller";
import { ClientToServerEvents, ServerToClientEvents } from "./Types";
import fs from 'fs';

const app = express();
export const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(router);

const options = {
  key: fs.readFileSync('./ssl/privateKey.key', 'utf-8'),
  cert: fs.readFileSync('./ssl/certificate.crt', 'utf-8')
}

// export const server = https.createServer(options, app);
export const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(
  server,
  {
    cors: {
      origin: `http://localhost:3000`,
      methods: ["GET", "POST"]
    }
  }
);

const peers = io.of('/mediasoup')

peers.on("connection", (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
  console.log(socket.id);
  socket.emit('connection_success', {
    socketId: socket.id
  })
});

export default app;
