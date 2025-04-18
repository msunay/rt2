import {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
  TransportOptions,
} from '@/Types/PeerSocketTypes';
import { Socket } from 'socket.io';
// import { types as mediasoupTypes } from 'mediasoup';
import * as mediasoup from 'mediasoup';
import { RtpCodecCapability } from 'mediasoup/node/lib/RtpParameters';
import util from 'util'
import { AppData, Consumer, Producer, ProducerOptions, Router, Transport, WebRtcServer, WebRtcServerOptions, WebRtcTransportOptions, Worker } from 'mediasoup/node/lib/types';

let msWorker: Worker;
let msRouter: Router;
let producerTransport: Transport | undefined;
let consumerTransport: Transport | undefined;
let producer: Producer;
let consumer: Consumer;

const createWorker = async () => {
  const worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 40000,
    logLevel: 'debug',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp',
      'message'
    ]
  });
  console.log(`worker pid: ${worker.pid}`);

  worker.on('died', (err) => {
    console.error('mediasoup worker has died', err);
    setTimeout(() => process.exit(1), 2000);
  });

  const udpAnnouncedAddress = process.env.NODE_ENV === 'production' ? process.env.UDP_ANNOUNCED_ADDRESS! : '127.0.0.1'
  const udpBindIp = process.env.NODE_ENV === 'production' ? process.env.UDP_BIND_IP! : '0.0.0.0'
  const tcpAnnouncedAddress = process.env.NODE_ENV === 'production' ? process.env.TCP_ANNOUNCED_ADDRESS! : '127.0.0.1'
  const tcpBindIp = process.env.NODE_ENV === 'production' ? process.env.TCP_BIND_IP! : '0.0.0.0'

  const webRtcServerOptions = {
    listenInfos:
      [
        {
          protocol: 'udp',
          ip: udpBindIp,
          announcedAddress: udpAnnouncedAddress,
        },
        {
          protocol: 'tcp',
          ip: tcpBindIp,
          announcedAddress: tcpAnnouncedAddress,

        }
      ]
  } as WebRtcServerOptions

  const webRtcServer = await worker.createWebRtcServer(webRtcServerOptions).catch(err => {
    console.error('Error:', err)
    process.exit(1);
  });

  worker.appData.webRtcServer = webRtcServer;

  return worker;
};

createWorker().then((w) => (msWorker = w));

const iceServers: RTCIceServer[] = [
  {
    "urls": "turn:a.relay.metered.ca:80",
    "username": process.env.ICE_USERNAME,
    "credential": process.env.ICE_CREDENTIAL
  },
  {
    "urls": "turn:a.relay.metered.ca:80?transport=tcp",
    "username": process.env.ICE_USERNAME,
    "credential": process.env.ICE_CREDENTIAL
  },
  {
    "urls": "turn:a.relay.metered.ca:443",
    "username": process.env.ICE_USERNAME,
    "credential": process.env.ICE_CREDENTIAL
  },
  {
    "urls": "turn:a.relay.metered.ca:443?transport=tcp",
    "username": process.env.ICE_USERNAME,
    "credential": process.env.ICE_CREDENTIAL
  }
];

const mediaCodecs: RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters:
    {
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/VP9',
    clockRate: 90000,
    parameters:
    {
      'profile-id': 2,
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters:
    {
      'packetization-mode': 1,
      'profile-level-id': '4d0032',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters:
    {
      'packetization-mode': 1,
      'profile-level-id': '42e01f',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000
    }
  },
];

const createWebRtcTransport = async (callback: ({ transportOptions }: { transportOptions: TransportOptions }) => void) => {
  try {
    const webRtcTransportOptions: WebRtcTransportOptions = {
      webRtcServer: msWorker.appData.webRtcServer as WebRtcServer<AppData>,
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

    console.log('Transport Params:!!!!!!!!!!!!!!!!!!!!!!');
    console.log(util.inspect({
      transportParams: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        // iceServers
      },
    }, { showHidden: false, depth: null, colors: true }))
    callback({
      transportOptions: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        // iceServers
      },
    });
    return transport;
  } catch (error) {
    console.error(error);

    // callback({
    //   transportParams: {
    //     error,
    //   },
    // });
  }
};

let i = 0, clients = 1;
const peersSocketInit = async (
  peers: Socket<PeersServerToClientEvents, PeersClientToServerEvents>
) => {
  console.log(`\n\nclients: -- ${clients++} --\n\nconnection-${i++}:\n\tpeers ID: `, peers.id);

  peers.emit('connection_success', {
    socketId: peers.id,
    producerAlreadyExists: producer ? true : false,
  });

  peers.on('disconnect', () => {
    clients--;
    console.log('peer disconnected');
    consumer?.close();
    producer?.close();
    consumerTransport?.close();
    producerTransport?.close();
  });

  const getRtpCapabilities = (callback: any) => {
    const rtpCapabilities = msRouter.rtpCapabilities;

    callback({ rtpCapabilities });
  };

  peers.on('create_room', async (callback) => {
    if (msRouter === undefined) {
      msRouter = await msWorker.createRouter({ mediaCodecs });
      console.log(`Router ID: ${msRouter.id}`);
    }

    getRtpCapabilities(callback);
  });

  peers.on('getRtpCapabilities', (callback) => {
    const rtpCapabilities = msRouter.rtpCapabilities;
    console.log('RTP Capabilities', rtpCapabilities);

    callback({ rtpCapabilities });
  });

  peers.on('createWebRtcTransport', async ({ sender }, callback) => {
    try {
      console.log(`Is this a sender request? ${sender ? 'Yes' : 'No'}`);
      if (sender) producerTransport = await createWebRtcTransport(callback);
      else consumerTransport = await createWebRtcTransport(callback);
    } catch (error) {
      console.log(error);
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
        appData
      } as ProducerOptions);

      console.log('Producer iD: ', producer.id, producer.kind);

      producer.on('transportclose', () => {
        console.log('transport for producer closed');
        // producer.close();
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
    console.log('!!!!!!!!!!!!hey biatch::::!!!!!!!!!!!!!!!!!!');
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
          peers.emit('producer_closed');

          // consumerTransport?.close();
        });

        const consumerOptions = {
          id: consumer.id,
          producerId: producer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        };
        console.log('consumerOptions:', consumerOptions)

        initConsumer({ consumerOptions });
      }
    } catch (err) {
      console.error(err);
      // initConsumer({
      //   params: {
      //     error: err,
      //   },
      // });
    }
  });
  peers.on('consumer_resume', async () => {
    console.log('consumer resume');
    await consumer.resume();
  });
};

export default peersSocketInit;
