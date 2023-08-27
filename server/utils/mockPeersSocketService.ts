import { types as mediasoupTypes } from 'mediasoup-client';
import Client from 'socket.io-client';
import { Socket, io } from 'socket.io-client';
import {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from './mockClientTypes';

export const peerSocket: Socket<PeersServerToClientEvents, PeersClientToServerEvents> =
//@ts-ignore
  new Client(`http://localhost:3001/mediasoup`);

interface parameters {
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}

type callback = ({ id }: { id: string }) => void;
export const mockPeersSocketService = {
  successListener: () =>
    peerSocket.on('connection_success', ({ socketId, producerAlreadyExists }) => {
      console.log('peerSocket socket connected :', socketId, producerAlreadyExists);
    }),

  emitCreateRoom: (
    createDevice: (
      rtpCapabilities: mediasoupTypes.RtpCapabilities
    ) => Promise<void>
  ) => {
    peerSocket.emit(
      'create_room',
      (data: { rtpCapabilities: mediasoupTypes.RtpCapabilities }) => {
        console.log('Router RTP Capabilities: ', data.rtpCapabilities);
        //assign to local variable
        createDevice(data.rtpCapabilities);
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
    peerSocket.emit(
      'createWebRtcTransport',
      { sender: true },
      ({ transportParams }) => {
        if (transportParams.error) {
          console.log(transportParams.error);
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
              peerSocket.emit('transport_connect', {
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
              peerSocket.emit(
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
    peerSocket.emit(
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
              peerSocket.emit('transport_recv_connect', {
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
    remoteVideo: any
  ) => {
    peerSocket.emit(
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

        const { track } = consumer;

        remoteVideo.current!.srcObject = new MediaStream([track]);

        peerSocket.emit('consumer_resume');
      }
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
    peerSocket.on('producer_closed', () => {
      // Server notified when producer is closed
      // consumerTransport.close();
      // consumer.close();
    }),
};


