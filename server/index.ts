import express from 'express';
import cors from 'cors';
import router from './router';
import http from 'http';
// import https from 'https';
import { Server, Socket } from 'socket.io';
import peersSocketInit from './controllers/peers.socket.controller';
import { ClientToServerEvents, ServerToClientEvents } from './Types';
import fs from 'fs';
import * as mediasoup from 'mediasoup';
import { types as mediasoupTypes } from 'mediasoup';
import { RtpCodecCapability } from 'mediasoup/node/lib/RtpParameters';
import util from 'util';

const app = express();
export const PORT = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(router);

const options = {
  key: fs.readFileSync('./ssl/privateKey.key', 'utf-8'),
  cert: fs.readFileSync('./ssl/certificate.crt', 'utf-8'),
};

// export const server = https.createServer(options, app);
export const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: `http://localhost:3000`,
    methods: ['GET', 'POST'],
  },
});

const peers = io.of('/mediasoup');

let msWorker: mediasoupTypes.Worker;
let msRouter: mediasoupTypes.Router;

const createWorker = async () => {
  msWorker = await mediasoup.createWorker();
  console.log(`worker pid: ${msWorker.pid}`);

  msWorker.on('died', (err) => {
    console.error('mediasoup worker has died');
    setTimeout(() => process.exit(1), 2000);
  });

  return msWorker;
};

createWorker().then((w) => (msWorker = w));

const mediaCodecs: RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/H264',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
      'packetization-mode': 1,
      'profile-level-id': '640033',
    },
  },
];

peers.on(
  'connection',
  async (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
    console.log(socket.id);

    socket.emit('connection_success', {
      socketId: socket.id,
    });

    socket.on('disconnect', () => {
      console.log('peer disconnected');
    });

    msRouter = await msWorker.createRouter({ mediaCodecs });

    socket.on('getRtpCapabilities', (callback) => {
      const rtpCapabilities = msRouter.rtpCapabilities;
      console.log('RTP Capabilities', rtpCapabilities);


      callback({ rtpCapabilities });
    });

    socket.on('createWebRtcTransport', async ({ sender }, callback) => {
      console.log(`Is this a sender request? ${sender}`);
      if (sender) producerTransport = await createWebRtcTransport(callback)
      else consumerTransport = await createWebRtcTransport(callback)
    })
  }
);

const createWebRtcTransport = async (callback) => {
  try {
    const webRtcTransportOptions: mediasoupTypes.WebRtcTransportOptions = {
      listenIps: [
        {
          ip: '127.0.0.1' // TODO .env fly.io server ip
        }
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    }

    let transport = await msRouter.createWebRtcTransport(webRtcTransportOptions);


  } catch (error) {
    console.error(error);
    callback({
      params: {
        error
      }
    })
  }
}
export default app;
