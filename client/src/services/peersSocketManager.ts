import type { UserStreamStateAction } from '@/reducers/userStreamStateReducer';
import type { types as mediasoupTypes } from 'mediasoup-client';
import type { Dispatch, SetStateAction } from 'react';
import { SocketManager } from './socketManager';
import type * as mediasoupClient from 'mediasoup-client';
import { MediaStream, type MediaStreamTrack } from 'react-native-webrtc';
import util from 'util';

interface parameters {
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}
type callback = ({ id }: { id: string }) => void;

export class PeersHostSocketManager extends SocketManager<'mediasoup'> {
  constructor() {
    super('mediasoup');
  }

  successListener = () => {
    this.getSocket().on('connection_success', ({ socketId, producerAlreadyExists }) => {
      console.log('peers host socket connected:', socketId, producerAlreadyExists);
    });
  };

  successListenerOff = () => {
    this.getSocket().off('connection_success', () => {
      console.log('peers host socket connection_success listener off');
    });
  };

  emitCreateRoom = (
    createDevice: (rtpCapabilities: mediasoupTypes.RtpCapabilities) => Promise<void>,
  ) => {
    this.getSocket().emit(
      'create_room',
      ({ rtpCapabilities }: { rtpCapabilities: mediasoupTypes.RtpCapabilities }) => {
        console.log('Router RTP Capabilities: ', rtpCapabilities);
        // assign to local variable
        createDevice(rtpCapabilities);
      },
    );
  };

  emitcreateProducerWebRtcTransport = (
    setProducerTransport: Dispatch<SetStateAction<mediasoupClient.types.Transport<mediasoupClient.types.AppData> | null>>,
    device: mediasoupTypes.Device,
    connectSendTransport: (producerTransport: mediasoupTypes.Transport) => Promise<void>,
  ) => {
    this.getSocket().emit(
      'createWebRtcTransport',
      { sender: true },
      ({ transportParams }) => {
        if (transportParams.error) {
          console.log('transportParams.error: ', transportParams.error);
          return;
        }
        console.log('transportParams: ', transportParams);

        const newProducerTransport = device.createSendTransport(transportParams);

        setProducerTransport(newProducerTransport);

        console.log('CreateSendTransport producerTransport: ', newProducerTransport);

        newProducerTransport.on(
          'connect',
          async (
            { dtlsParameters }: { dtlsParameters: mediasoupTypes.DtlsParameters },
            callback: () => void,
            errback: (error: Error) => void,
          ) => {
            try {
              // Singnal local DTLS parameters to the server side transport
              this.getSocket().emit('transport_connect', {
                dtlsParameters,
              });

              // Tell the transport that parameters were transmitted.
              callback();
            } catch (error) {
              errback(error as Error);
            }
          },
        );

        newProducerTransport.on(
          'produce',
          async (
            parameters: parameters,
            callback: callback,
            errback: (error: Error) => void,
          ) => {
            console.log('producer.on produce params: ', parameters);

            try {
              this.getSocket().emit(
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
        connectSendTransport(newProducerTransport);
      },
    );
  };

  emitCreateConsumerWebRtcTransport = (
    setConsumerTransport: Dispatch<SetStateAction<mediasoupClient.types.Transport<mediasoupClient.types.AppData> | null>>,
    device: mediasoupTypes.Device,
    connectRecvTransport: (
      consumerTransport: mediasoupTypes.Transport,
      device: mediasoupTypes.Device,
    ) => Promise<void>,
  ) => {
    this.getSocket().emit(
      'createWebRtcTransport',
      { sender: false },
      ({ transportParams }) => {
        if (transportParams.error) {
          console.log('transportParams.error: ', transportParams.error);
          return;
        }
        console.log('transportParams: ', transportParams);

        const newConsumerTransport = device.createRecvTransport(transportParams);

        setConsumerTransport(newConsumerTransport);

        console.log('CreateRecvTransport consumerTransport: ', newConsumerTransport);

        newConsumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            // Singnal local DTLS parameters to the server side transport
            this.getSocket().emit('transport_recv_connect', {
              dtlsParameters,
            });

            // Tell the transport that parameters were transmitted.
            callback();
          } catch (error) {
            errback(error as Error);
          }
        });

        connectRecvTransport(newConsumerTransport, device);
      },
    );
  };

  emitConsume = (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    device: mediasoupTypes.Device,
    setConsumer: Dispatch<SetStateAction<mediasoupClient.types.Consumer<mediasoupClient.types.AppData> | null>>,
    setMediaStream: Dispatch<SetStateAction<MediaStream | null>>,
  ) => {
    this.getSocket().emit(
      'consume',
      { rtpCapabilities: device.rtpCapabilities },
      async ({ params }) => {
        if (params.error) {
          console.error(params.error);
          console.log('Cannot consume');
          return;
        }

        console.log('params: ', params);

        const newConsumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        setConsumer(newConsumer);

        console.log('consumer: ', newConsumer);

        const { track } = newConsumer;

        const producerTrack = new MediaStream([track as unknown as MediaStreamTrack]);
        producerTrack.getTracks()[0];
        console.log('producerTrack: ', producerTrack);

        // dispatchUserState({ type: 'SET_US_MEDIA_STREAM', payload: producerTrack });
        setMediaStream(producerTrack)
        this.getSocket().emit('consumer_resume');
      },
    );

    return {
      // newConsumer,
      consumerTransport,
    };
  };

  producerClosedListener = (
    consumerTransport: mediasoupTypes.Transport<mediasoupTypes.AppData>,
    consumer: mediasoupTypes.Consumer,
  ) => {
    this.getSocket().on('producer_closed', () => {
      // Server notified when producer is closed
      consumer.close();
      consumerTransport.close();
    });
  };

  producerClosedListenerOff = () => {
    this.getSocket().off('producer_closed', () => {
      console.log('peers host socket producer_closed listener off');
    });
  };
}
