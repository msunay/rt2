import { ClientToServerEvents, ServerToClientEvents } from '../PeerSocketTypes';
import { Socket } from 'socket.io';
import { types as mediasoupTypes } from 'mediasoup';
import * as mediasoup from 'mediasoup';
import { RtpCodecCapability } from 'mediasoup/node/lib/RtpParameters';


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

    console.log('Transport Params: ', {
      transportParams: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    });
    callback({
      transportParams: {
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
      transportParams: {
        error,
      },
    });
  }
};

const peersSocketInit = async (peers: Socket<ServerToClientEvents, ClientToServerEvents>) => {
  console.log(peers.id);

  peers.emit('connection_success', {
    socketId: peers.id,
    producerAlreadyExists: producer ? true : false,
  });

  peers.on('disconnect', () => {
    console.log('peer disconnected');
  });

  peers.on('create_room', async (callback) => {
    if (msRouter === undefined) {
      msRouter = await msWorker.createRouter({ mediaCodecs });
      console.log(`Router ID: ${msRouter.id}`);
    }

    getRtpCapabilities(callback);
  });

  const getRtpCapabilities = (callback: any) => {
    const rtpCapabilities = msRouter.rtpCapabilities;

    callback({ rtpCapabilities });
  };

  peers.on('getRtpCapabilities', (callback) => {
    const rtpCapabilities = msRouter.rtpCapabilities;
    console.log('RTP Capabilities', rtpCapabilities);

    callback({ rtpCapabilities });
  });

  peers.on('createWebRtcTransport', async ({ sender }, callback) => {
    try {
      console.log(`Is this a sender request? ${sender}`);
      if (sender) producerTransport = await createWebRtcTransport(callback);
      else consumerTransport = await createWebRtcTransport(callback);
    } catch (error) {
      console.log(error)
    }
  });

  peers.on('transport_connect', async ({ dtlsParameters }) => {
    console.log('DTLS Params: ', { dtlsParameters });
    await producerTransport!.connect({ dtlsParameters });
  });

  peers.on(
    'transport_produce',
    async ({ kind, rtpParameters, appData }, sendServerTransportId) => {
      console.log(producerTransport);
      producer = await producerTransport!.produce({
        kind,
        rtpParameters,
      });

      console.log('Producer iD: ', producer.id, producer.kind);

      producer.on('transportclose', () => {
        console.log('transport for this producer closed');
        producer.close();
      });

      sendServerTransportId({
        id: producer.id,
      });
    }
  );

  peers.on('transport_recv_connect', async ({ dtlsParameters }) => {
    console.log(`DTLS params: ${dtlsParameters}`);
    await consumerTransport?.connect({ dtlsParameters });
  });

  peers.on('consume', async ({ rtpCapabilities }, initConsumer) => {
    try {
      if (
        msRouter.canConsume({
          producerId: producer.id,
          rtpCapabilities,
        })
      ) {
        consumer = await consumerTransport!.consume({
          producerId: producer.id,
          rtpCapabilities,
          paused: true,
        });
        consumer.on('transportclose', () => {
          console.log('Transport closed from consumer');
        });

        consumer.on('producerclose', () => {
          console.log('Producer of consumer closed');
        });

        const params = {
          id: consumer.id,
          producerId: producer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        };
        initConsumer({ params });
      }
    } catch (err: any) {
      console.error(err);
      initConsumer({
        params: {
          error: err,
        },
      });
    }
  });
  peers.on('consumer_resume', async () => {
    console.log('consumer resume');
    await consumer.resume();
  });
}

export default peersSocketInit;
