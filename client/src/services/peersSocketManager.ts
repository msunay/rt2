import type { UserStreamStateAction } from '@/reducers/userStreamStateReducer';
import type * as mediasoupClient from 'mediasoup-client';
import type {
  AppData,
  Consumer,
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  Transport,
  TransportOptions,
} from 'mediasoup-client/lib/types';
// import type { types as mediasoupTypes} from 'mediasoup-client';
import type { Dispatch, SetStateAction } from 'react';
import { MediaStream, type MediaStreamTrack } from 'react-native-webrtc';
import { SocketManager } from './socketManager';

interface parameters {
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
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
    createDevice: (rtpCapabilities: RtpCapabilities) => Promise<void>,
  ) => {
    this.getSocket().emit(
      'create_room',
      ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities }) => {
        console.log('Router RTP Capabilities: ', rtpCapabilities);
        // assign to local variable
        createDevice(rtpCapabilities);
      },
    );
  };

  emitcreateProducerWebRtcTransport = (
    setProducerTransport: Dispatch<
      SetStateAction<mediasoupClient.types.Transport<mediasoupClient.types.AppData> | null>
    >,
    device: mediasoupClient.Device,
    connectSendTransport: (producerTransport: Transport) => Promise<void>,
  ) => {
    this.getSocket().emit(
      'createWebRtcTransport',
      { sender: true },
      ({ transportOptions }) => {
        // @ts-ignore
        if (!transportOptions /*  || transportOptions.error */) {
          // @ts-ignore
          // console.error('transportOptions: ', transportOptions.error);
          throw new Error('transportOptions is null');
        }
        console.log('transportOptions: ', transportOptions);

        const newProducerTransport = device.createSendTransport(transportOptions);

        setProducerTransport(newProducerTransport);

        console.log('CreateSendTransport producerTransport: ', newProducerTransport);

        newProducerTransport.on(
          'connect',
          async (
            { dtlsParameters }: { dtlsParameters: DtlsParameters },
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
    setConsumerTransport: Dispatch<SetStateAction<Transport<AppData> | null>>,
    device: mediasoupClient.Device,
    connectRecvTransport: (
      consumerTransport: Transport,
      device: mediasoupClient.Device,
    ) => Promise<void>,
  ) => {
    this.getSocket().emit(
      'createWebRtcTransport',
      { sender: false },
      ({ transportOptions }) => {
        // @ts-ignore
        if (/* transportOptions.error ||  */ !transportOptions) {
          // @ts-ignore
          // console.error('transportOptions.error: ', transportOptions.error);
          throw new Error('transportOptions is null or .error above');
        }
        console.log('transportOptions: ', transportOptions);

        const newConsumerTransport = device.createRecvTransport(transportOptions);

        setConsumerTransport(newConsumerTransport);

        console.log('CreateRecvTransport consumerTransport: ', newConsumerTransport);

        newConsumerTransport.on(
          'connect',
          async ({ dtlsParameters }, callback, errback) => {
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
          },
        );

        connectRecvTransport(newConsumerTransport, device);
      },
    );
    console.log('dddddddddd!!!!!!!!');
  };

  emitConsume = (
    consumerTransport: Transport<AppData>,
    device: mediasoupClient.Device,
    setConsumer: Dispatch<SetStateAction<Consumer<AppData> | null>>,
    setMediaStream: Dispatch<SetStateAction<MediaStream | null>>,
  ) => {
    this.getSocket().emit(
      'consume',
      { rtpCapabilities: device.rtpCapabilities },
      async ({ consumerOptions }) => {
        console.log('consumerOptions: ', consumerOptions);
        try {
          // @ts-ignore
          if (/* consumerOptions.error ||  */ !consumerOptions) {
            // @ts-ignore
            // console.error('consumerOptions.error', consumerOptions.error);
            throw new Error('consumerOptions is null or .error above');
          }

          console.log('consumerOptions: ', consumerOptions);

          const newConsumer = await consumerTransport.consume(consumerOptions);

          setConsumer(newConsumer);

          console.log('consumer: ', newConsumer);

          const { track } = newConsumer;

          const producerTrack = new MediaStream([
            track /*  as unknown as MediaStreamTrack */,
          ]);
          producerTrack.getTracks()[0];
          console.log('producerTrack: ', producerTrack);
          console.log('producerTrack.getTracks()[0]: ', producerTrack.getTracks()[0]);

          // dispatchUserState({ type: 'SET_US_MEDIA_STREAM', payload: producerTrack });
          setMediaStream(producerTrack);
          this.getSocket().emit('consumer_resume');
        } catch (error) {
          console.error('consume error: ', error);
        }
      },
    );

    return {
      // newConsumer,
      consumerTransport,
    };
  };

  producerClosedListener = (
    consumerTransport: Transport<AppData>,
    consumer: Consumer,
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
