import type * as mediasoupClient from 'mediasoup-client';
import type {
  AppData,
  Consumer,
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  Transport,
} from 'mediasoup-client/lib/types';
import { MediaStream } from 'react-native-webrtc';
import { WebSocketManager } from '@/src/services/webSocketManager';
import { 
  setConsumerTransport, 
  setConsumer, 
  setMediaStream,
} from '@/src/features/mediaStreamSlice';
import { AppDispatch } from '@/src/store';

/**
 * Parameters interface for producer transport
 */
interface ProducerParameters {
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
}

/**
 * Callback type for producer
 */
type ProducerCallback = ({ id }: { id: string }) => void;

/**
 * Socket manager for streaming host
 */
export class MediaStreamBroadcaster extends WebSocketManager<'mediasoup'> {
  /**
   * Creates a new streaming host socket manager
   */
  constructor() {
    super('mediasoup');
  }

  /**
   * Sets up connection success listener
   */
  public setupConnectionListener(): void {
    this.addListener('connection_success', ({ socketId, producerAlreadyExists }) => {
      console.log('Streaming host socket connected:', socketId, producerAlreadyExists);
    }, 'Streaming host connection');
  }

  /**
   * Removes connection success listener
   */
  public removeConnectionListener(): void {
    this.removeListener('connection_success', null, 'Streaming host connection');
  }

  /**
   * Sets up producer closed listener
   * @param consumerTransport Consumer transport
   * @param consumer Consumer
   */
  public setupProducerClosedListener(
    consumerTransport: Transport<AppData>,
    consumer: Consumer<AppData>
  ): void {
    this.addListener('producer_closed', () => {
      // Server notified when producer is closed
      consumer.close();
      consumerTransport.close();
    }, 'Producer closed');
  }

  /**
   * Removes producer closed listener
   */
  public removeProducerClosedListener(): void {
    this.removeListener('producer_closed', null, 'Producer closed');
  }

  /**
   * Creates a room for mediasoup peers
   * @param createDevice Function to create a device with RTP capabilities
   */
  public createRoom(
    createDevice: (rtpCapabilities: RtpCapabilities) => Promise<void>
  ): void {
    this.getSocket().emit(
      'create_room',
      ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities }) => {
        console.log('Router RTP Capabilities:', rtpCapabilities);
        createDevice(rtpCapabilities).catch(err => {
          console.error('Error creating device:', err);
        });
      }
    );
  }

  /**
   * Creates a producer WebRTC transport
   * @param setProducerTransport Function to set the producer transport
   * @param device Mediasoup device
   * @param connectSendTransport Function to connect the send transport
   */
  public createProducerTransport(
    setProducerTransport: (transport: Transport<AppData>) => void,
    device: mediasoupClient.Device,
    connectSendTransport: (producerTransport: Transport<AppData>) => Promise<void>
  ): void {
    this.getSocket().emit(
      'createWebRtcTransport',
      { sender: true },
      ({ transportOptions }) => {
        if (!transportOptions) {
          console.error('Transport options are null');
          throw new Error('Transport options are null');
        }
        
        console.log('Producer transport options:', transportOptions);
        
        try {
          const newProducerTransport = device.createSendTransport(transportOptions);
          setProducerTransport(newProducerTransport);
          
          console.log('Created send transport:', newProducerTransport);
          
          // Handle transport connect event
          newProducerTransport.on(
            'connect',
            async (
              { dtlsParameters }: { dtlsParameters: DtlsParameters },
              callback: () => void,
              errback: (error: Error) => void
            ) => {
              try {
                // Signal local DTLS parameters to the server side transport
                this.getSocket().emit('transport_connect', {
                  dtlsParameters,
                });
                callback();
              } catch (error) {
                errback(error as Error);
              }
            }
          );
          
          // Handle transport produce event
          newProducerTransport.on(
            'produce',
            async (
              parameters: ProducerParameters,
              callback: ProducerCallback,
              errback: (error: Error) => void
            ) => {
              console.log('Producer parameters:', parameters);
              
              try {
                this.getSocket().emit(
                  'transport_produce',
                  {
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                  },
                  ({ id }) => {
                    callback({ id });
                  }
                );
              } catch (err) {
                errback(err as Error);
              }
            }
          );
          
          // Connect the transport
          connectSendTransport(newProducerTransport).catch(err => {
            console.error('Error connecting send transport:', err);
          });
        } catch (err) {
          console.error('Error creating send transport:', err);
          throw err;
        }
      }
    );
  }

  /**
   * Creates a consumer WebRTC transport
   * @param setConsumerTransport Function to set the consumer transport
   * @param device Mediasoup device
   * @param connectRecvTransport Function to connect the receive transport
   */
  public createConsumerTransport(
    setConsumerTransportCb: (transport: Transport<AppData>) => void,
    device: mediasoupClient.Device,
    connectRecvTransport: (
      consumerTransport: Transport<AppData>,
      device: mediasoupClient.Device
    ) => Promise<void>
  ): void {
    this.getSocket().emit(
      'createWebRtcTransport',
      { sender: false },
      ({ transportOptions }) => {
        if (!transportOptions) {
          console.error('Transport options are null');
          throw new Error('Transport options are null');
        }
        
        console.log('Consumer transport options:', transportOptions);
        
        try {
          const newConsumerTransport = device.createRecvTransport(transportOptions);
          setConsumerTransportCb(newConsumerTransport);
          
          console.log('Created receive transport:', newConsumerTransport);
          
          // Handle transport connect event
          newConsumerTransport.on(
            'connect',
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // Signal local DTLS parameters to the server side transport
                this.getSocket().emit('transport_recv_connect', {
                  dtlsParameters,
                });
                callback();
              } catch (error) {
                errback(error as Error);
              }
            }
          );
          
          // Connect the transport
          connectRecvTransport(newConsumerTransport, device).catch(err => {
            console.error('Error connecting receive transport:', err);
          });
        } catch (err) {
          console.error('Error creating receive transport:', err);
          throw err;
        }
      }
    );
  }

  /**
   * Consumes a producer's media
   * @param consumerTransport Consumer transport
   * @param device Mediasoup device
   * @param setConsumerCb Function to set the consumer
   * @param setMediaStreamCb Function to set the media stream
   * @returns Consumer and transport
   */
  public consume(
    consumerTransport: Transport<AppData>,
    device: mediasoupClient.Device,
    setConsumerCb: (consumer: Consumer<AppData>) => void,
    setMediaStreamCb: (mediaStream: MediaStream) => void
  ): { consumerTransport: Transport<AppData> } {
    this.getSocket().emit(
      'consume',
      { rtpCapabilities: device.rtpCapabilities },
      async ({ consumerOptions }) => {
        if (!consumerOptions) {
          console.error('Consumer options are null');
          throw new Error('Consumer options are null');
        }
        
        console.log('Consumer options:', consumerOptions);
        
        try {
          const newConsumer = await consumerTransport.consume(consumerOptions);
          setConsumerCb(newConsumer);
          
          console.log('Created consumer:', newConsumer);
          
          const { track } = newConsumer;
          console.log('Consumer track:', track);
          
          // @ts-expect-error - Ignoring type mismatch between mediasoup and react-native-webrtc MediaStreamTrack
          const producerTrack = new MediaStream([track]);
          console.log('Producer track:', producerTrack);
          console.log('First track:', producerTrack.getTracks()[0]);
          
          setMediaStreamCb(producerTrack);
          this.getSocket().emit('consumer_resume');
        } catch (error) {
          console.error('Error consuming:', error);
        }
      }
    );
    
    return { consumerTransport };
  }

  /**
   * Create Redux-compatible versions of the methods
   */
  public createConsumerTransportWithRedux(
    dispatch: AppDispatch,
    device: mediasoupClient.Device,
    connectRecvTransport: (
      consumerTransport: Transport<AppData>,
      device: mediasoupClient.Device
    ) => Promise<void>
  ): void {
    this.createConsumerTransport(
      (transport) => dispatch(setConsumerTransport(transport)),
      device,
      connectRecvTransport
    );
  }

  public consumeWithRedux(
    dispatch: AppDispatch,
    consumerTransport: Transport<AppData>,
    device: mediasoupClient.Device
  ): { consumerTransport: Transport<AppData> } {
    return this.consume(
      consumerTransport,
      device,
      (consumer) => dispatch(setConsumer(consumer)),
      (mediaStream) => dispatch(setMediaStream(mediaStream))
    );
  }
}