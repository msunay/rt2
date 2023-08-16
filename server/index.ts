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
let producerTransport: mediasoupTypes.Transport | undefined;
let consumerTransport: mediasoupTypes.Transport | undefined;
let producer: mediasoupTypes.Producer;
let consumer: mediasoupTypes.Consumer;

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
      producerAlreadyExists: producer ? true : false
    });

    socket.on('disconnect', () => {
      console.log('peer disconnected');
    });

    socket.on('create_room', async (callback) => {
      if (msRouter === undefined) {
        msRouter = await msWorker.createRouter({ mediaCodecs });
        console.log(`Router ID: ${msRouter.id}`);
      }

      getRtpCapabilities(callback)
    })

    const getRtpCapabilities = (callback: any) => {
      const rtpCapabilities = msRouter.rtpCapabilities

      callback({ rtpCapabilities })
    }

    socket.on('getRtpCapabilities', (callback) => {
      const rtpCapabilities = msRouter.rtpCapabilities;
      console.log('RTP Capabilities', rtpCapabilities);

      callback({ rtpCapabilities });
    });

    socket.on('createWebRtcTransport', async ({ sender }, callback) => {
      console.log(`Is this a sender request? ${sender}`);
      if (sender)
        producerTransport = await createWebRtcTransport(callback);
      else
        consumerTransport = await createWebRtcTransport(callback);
    });

    socket.on('transport_connect', async ({ dtlsParameters }) => {
      console.log('DTLS Params: ', { dtlsParameters });
      await producerTransport!.connect({ dtlsParameters });
    });

    socket.on(
      'transport_produce',
      async ({ kind, rtpParameters, appData }, callback) => {
        producer = await producerTransport!.produce({
          kind,
          rtpParameters,
        });

        console.log('Producer iD: ', producer.id, producer.kind);

        producer.on('transportclose', () => {
          console.log('transport for this producer closed');
          producer.close();
        });

        callback({
          id: producer.id,
        });
      }
    );
    socket.on('transport_recv_connect', async ({ dtlsParameters }) => {
      console.log(`DTLS params: ${dtlsParameters}`);
      await consumerTransport?.connect({ dtlsParameters })
    })

    socket.on('consume', async ({ rtpCapabilities }, callback) => {
      try {
        if (msRouter.canConsume({
          producerId: producer.id,
          rtpCapabilities
        })) {
          consumer = await consumerTransport!.consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: true
          })
          consumer.on('transportclose', () => {
            console.log('Transport closed from consumer');
          })

          consumer.on('producerclose', () => {
            console.log('Producer of consumer closed');
          })

          const params = {
            id: consumer.id,
            producerId: producer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters
          }
          console.log(params);
          callback({ params })
        }
      } catch (err: any) {
        console.error(err)
        callback({
          params: {
            error: err
          }
        })
      }
    })
    socket.on('consumer_resume',async () => {
      console.log('consumer resume');
      await consumer.resume()
    })
  }
);


const createWebRtcTransport = async (callback: any) => {
  try {
    const webRtcTransportOptions: mediasoupTypes.WebRtcTransportOptions = {
      listenIps: [
        {
          ip: '127.0.0.1', // TODO .env fly.io server ip
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    };

    let transport = await msRouter.createWebRtcTransport(
      webRtcTransportOptions
    );
    console.log(`transport id: ${transport.id}`);

    transport.on('dtlsstatechange', (dtlsState) => {
      if (dtlsState === 'closed') {
        transport.close();
      }
    });

    transport.on('@close', () => {
      console.log('Transport closed');
    });

    callback({
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    });
    return transport;
  } catch (error) {
    console.error(error);
    callback({
      params: {
        error,
      },
    });
  }
};

export default app;
