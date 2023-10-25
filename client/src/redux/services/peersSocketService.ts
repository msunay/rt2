import { Socket, io } from 'socket.io-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from '@/Types/PeerSocketTypes';

const BASE_URL =
process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_BACKEND_URL
  : 'http://localhost:3001/';


const peers: Socket<PeersServerToClientEvents, PeersClientToServerEvents> = io(
  `${BASE_URL}mediasoup`
);

interface parameters {
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}
type callback = ({ id }: { id: string }) => void;

export const peersSocketService = {
  successListener: () =>
    peers.on('connection_success', ({ socketId, producerAlreadyExists }) => {
      console.log('peers socket connected:', socketId, producerAlreadyExists);
    }),

  emitCreateRoom: (
    createDevice: (
      rtpCapabilities: mediasoupTypes.RtpCapabilities
    ) => Promise<void>
  ) => {
    peers.emit(
      'create_room',
      ({ rtpCapabilities }: { rtpCapabilities: mediasoupTypes.RtpCapabilities }) => {
        console.log('Router RTP Capabilities: ', rtpCapabilities);
        //assign to local variable
        createDevice(rtpCapabilities);
      }
    );
  },

  emitcreateProducerWebRtcTransport: (
    producerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
    connectSendTransport: (
      producerTransport: mediasoupTypes.Transport
    ) => Promise<void>
  ) => {
    peers.emit(
      'createWebRtcTransport',
      { sender: true },
      ({ transportParams }) => {
        if (transportParams.error) {
          console.log('transportParams.error: ', transportParams.error);
          return;
        }
        console.log('transportParams: ', transportParams);

        producerTransport = device.createSendTransport(transportParams);

        console.log(
          'CreateSendTransport producerTransport: ',
          producerTransport
        );

        producerTransport.on(
          'connect',
          async (
            {
              dtlsParameters,
            }: { dtlsParameters: mediasoupTypes.DtlsParameters },
            callback: () => void,
            errback: (error: Error) => void
          ) => {
            try {
              // Singnal local DTLS parameters to the server side transport
              peers.emit('transport_connect', {
                dtlsParameters: dtlsParameters,
              });

              // Tell the transport that parameters were transmitted.
              callback();
            } catch (error: any) {
              errback(error);
            }
          }
        );

        producerTransport.on(
          'produce',
          async (
            parameters: parameters,
            callback: callback,
            errback: (error: Error) => void
          ) => {
            console.log('producer.on produce params: ', parameters);

            try {
              peers.emit(
                'transport_produce',
                {
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  appData: parameters.appData,
                },
                ({ id }) => {
                  // Tell the transport that parameters were transmitted and provide it with the
                  // server side producers's id
                  callback({ id });
                }
              );
            } catch (err: any) {
              errback(err);
            }
          }
        );
        connectSendTransport(producerTransport);
      }
    );
  },

  emitcreateConsumerWebRtcTransport: (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
    connectRecvTransport: (
      consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
      device: mediasoupTypes.Device
    ) => Promise<void>
  ) => {
    peers.emit(
      'createWebRtcTransport',
      { sender: false },
      ({ transportParams }) => {
        if (transportParams.error) {
          console.log(transportParams.error);
          return;
        }
        console.log('transportParams: ', transportParams);
        // Create recv transport
        consumerTransport = device.createRecvTransport(transportParams);

        console.log(
          'CreateRecvTransport consumerTransport: ',
          consumerTransport
        );

        consumerTransport.on(
          'connect',
          async ({ dtlsParameters }, callback, errback) => {
            try {
              // Signal local DTLS parameters to the server side transport
              peers.emit('transport_recv_connect', {
                // transportId: consumerTransport.id,
                dtlsParameters,
              });
              // Tell the transport that parameters were transmitted
              callback();
            } catch (err: any) {
              errback(err);
            }
          }
        );

        connectRecvTransport(consumerTransport, device);
      }
    );
  },

  emitConsume: (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
    consumer: mediasoupTypes.Consumer,
    remoteVideo: React.RefObject<HTMLVideoElement>
  ) => {
    peers.emit(
      'consume',
      {
        rtpCapabilities: device.rtpCapabilities,
      },
      async ({ params }) => {
        if (params.error) {
          console.log('Cannnot consume');
          return;
        }

        console.log(params);
        consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        console.log('consumer: ', consumer);

        const { track } = consumer;

        const producerTrack = new MediaStream([track]);
        // producerTrack.getTracks()[0]
        console.log('remote vid ref: ', remoteVideo.current);
        console.log('producerTrack: ', producerTrack);
        remoteVideo.current!.srcObject = producerTrack;

        peers.emit('consumer_resume');
      }
    );
    return {
      consumerTransport,
      consumer
    }
  },

  producerClosedListener: (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    consumer: mediasoupTypes.Consumer
  ) => peers.on('producer_closed', () => {
    // Server notified when producer is closed
    // consumerTransport.close();
    // consumer.close();
  })
};
