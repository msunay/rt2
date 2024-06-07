import type { UserStreamStateAction } from '@/reducers/userStreamStateReducer';
import type {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from '@/types/PeerSocketTypes';
import type { types as mediasoupTypes } from 'mediasoup-client';
import type { Dispatch } from 'react';
// import { MediaStream } from 'react-native-webrtc';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
// import { mediasoupNSP } from '@/app/(app)/(quiz)/_layout';


interface parameters {
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}
type callback = ({ id }: { id: string }) => void;

export const peersSocketService = {
  successListener: () =>
    mediasoupNSP.on('connection_success', ({ socketId, producerAlreadyExists }) => {
      console.log('peers socket connected:', socketId, producerAlreadyExists);
    }),

  successListenerOff: () =>
    mediasoupNSP.off('connection_success', () => {
      console.log('peers socket connection_success listener off');
    }),

  emitCreateRoom: (
    createDevice: (rtpCapabilities: mediasoupTypes.RtpCapabilities) => Promise<void>,
  ) => {
    mediasoupNSP.emit(
      'create_room',
      ({ rtpCapabilities }: { rtpCapabilities: mediasoupTypes.RtpCapabilities }) => {
        console.log('Router RTP Capabilities: ', rtpCapabilities);
        // assign to local variable
        createDevice(rtpCapabilities);
      },
    );
  },

  emitcreateProducerWebRtcTransport: (
    producerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
    connectSendTransport: (producerTransport: mediasoupTypes.Transport) => Promise<void>,
  ) => {
    mediasoupNSP.emit('createWebRtcTransport', { sender: true }, ({ transportParams }) => {
      if (transportParams.error) {
        console.log('transportParams.error: ', transportParams.error);
        return;
      }
      console.log('transportParams: ', transportParams);

      // biome-ignore lint: <explanation>
      producerTransport = device.createSendTransport(transportParams);

      console.log('CreateSendTransport producerTransport: ', producerTransport);

      producerTransport.on(
        'connect',
        async (
          { dtlsParameters }: { dtlsParameters: mediasoupTypes.DtlsParameters },
          callback: () => void,
          errback: (error: Error) => void,
        ) => {
          try {
            // Singnal local DTLS parameters to the server side transport
            mediasoupNSP.emit('transport_connect', {
              dtlsParameters,
            });

            // Tell the transport that parameters were transmitted.
            callback();
          } catch (error) {
            errback(error as Error);
          }
        },
      );

      producerTransport.on(
        'produce',
        async (
          parameters: parameters,
          callback: callback,
          errback: (error: Error) => void,
        ) => {
          console.log('producer.on produce params: ', parameters);

          try {
            mediasoupNSP.emit(
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
              },
            );
          } catch (err) {
            errback(err as Error);
          }
        },
      );
      connectSendTransport(producerTransport);
    });
  },

  emitcreateConsumerWebRtcTransport: (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
    connectRecvTransport: (
      consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
      device: mediasoupTypes.Device,
    ) => Promise<void>,
  ) => {
    mediasoupNSP.emit('createWebRtcTransport', { sender: false }, ({ transportParams }) => {
      if (transportParams.error) {
        console.log(transportParams.error);
        return;
      }
      console.log('transportParams: ', transportParams);
      // Create recv transport
      // biome-ignore lint: <explanation>
      consumerTransport = device.createRecvTransport(transportParams);

      console.log('CreateRecvTransport consumerTransport: ', consumerTransport);

      consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          // Signal local DTLS parameters to the server side transport
          mediasoupNSP.emit('transport_recv_connect', {
            // transportId: consumerTransport.id,
            dtlsParameters,
          });
          // Tell the transport that parameters were transmitted
          callback();
        } catch (err) {
          errback(err as Error);
        }
      });

      connectRecvTransport(consumerTransport, device);
    });
  },

  emitConsume: (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
    consumer: mediasoupTypes.Consumer,
    dispatchUserState: Dispatch<UserStreamStateAction>,
  ) => {
    mediasoupNSP.emit(
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
        // biome-ignore lint: <explanation>
        consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        console.log('consumer: ', consumer);

        const { track } = consumer;

        const producerTrack = new MediaStream([track]);
        producerTrack.getTracks()[0]
        console.log('producerTrack: ', producerTrack);
        // biome-ignore lint: <explanation>
        // remoteVideo.current!.srcObject = producerTrack; // BUG
        dispatchUserState({type: 'SET_US_MEDIA_STREAM', payload: producerTrack})

        mediasoupNSP.emit('consumer_resume');
      },
    );
    return {
      consumerTransport,
      consumer,
    };
  },

  producerClosedListener: (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    consumer: mediasoupTypes.Consumer
  ) =>
    mediasoupNSP.on('producer_closed', () => {
      // Server notified when producer is closed
      consumerTransport.close();
      consumer.close();
    }),

    producerClosedListenerOff: () =>
      mediasoupNSP.off('producer_closed', () => {
        console.log('peers socket producer_closed listener off');
      }),
};
