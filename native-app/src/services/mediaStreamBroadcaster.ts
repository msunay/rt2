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
import { MediaStream, MediaStreamTrack } from 'react-native-webrtc';
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
      this.log(`Streaming host socket connected: ${socketId}, producer exists: ${producerAlreadyExists}`);
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
      try {
        consumer.close();
        consumerTransport.close();
      } catch (error) {
        this.log(`Error closing consumer and transport: ${(error as Error).message}`, 'error');
      }
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
    this.emitWithErrorHandling(
      'create_room',
      {},
      ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities }) => {
        this.log('Router RTP Capabilities received');
        createDevice(rtpCapabilities).catch(err => {
          this.log(`Error creating device: ${err.message}`, 'error');
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
    this.emitWithErrorHandling(
      'createWebRtcTransport',
      { sender: true },
      ({ transportOptions }) => {
        if (!transportOptions) {
          const error = new Error('Transport options are null');
          this.log(error.message, 'error');
          throw error;
        }
        
        this.log('Producer transport options received');
        
        try {
          const newProducerTransport = device.createSendTransport(transportOptions);
          setProducerTransport(newProducerTransport);
          
          this.log(`Created send transport: ${newProducerTransport.id}`);
          
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
                this.emitWithErrorHandling('transport_connect', {
                  dtlsParameters,
                });
                callback();
              } catch (error) {
                this.log(`Error in transport connect event: ${(error as Error).message}`, 'error');
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
              this.log(`Producer parameters received: ${parameters.kind}`);
              
              try {
                this.emitWithErrorHandling(
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
                this.log(`Error in transport produce event: ${(err as Error).message}`, 'error');
                errback(err as Error);
              }
            }
          );
          
          // Connect the transport
          connectSendTransport(newProducerTransport).catch(err => {
            this.log(`Error connecting send transport: ${err.message}`, 'error');
          });
        } catch (err) {
          this.log(`Error creating send transport: ${(err as Error).message}`, 'error');
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
    this.emitWithErrorHandling(
      'createWebRtcTransport',
      { sender: false },
      ({ transportOptions }) => {
        if (!transportOptions) {
          const error = new Error('Transport options are null');
          this.log(error.message, 'error');
          throw error;
        }
        
        this.log('Consumer transport options received');
        
        try {
          const newConsumerTransport = device.createRecvTransport(transportOptions);
          setConsumerTransportCb(newConsumerTransport);
          
          this.log(`Created receive transport: ${newConsumerTransport.id}`);
          
          // Handle transport connect event
          newConsumerTransport.on(
            'connect',
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // Signal local DTLS parameters to the server side transport
                this.emitWithErrorHandling('transport_recv_connect', {
                  dtlsParameters,
                });
                callback();
              } catch (error) {
                this.log(`Error in transport connect event: ${(error as Error).message}`, 'error');
                errback(error as Error);
              }
            }
          );
          
          // Connect the transport
          connectRecvTransport(newConsumerTransport, device).catch(err => {
            this.log(`Error connecting receive transport: ${err.message}`, 'error');
          });
        } catch (err) {
          this.log(`Error creating receive transport: ${(err as Error).message}`, 'error');
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
    this.emitWithErrorHandling(
      'consume',
      { rtpCapabilities: device.rtpCapabilities },
      async ({ consumerOptions }) => {
        if (!consumerOptions) {
          const error = new Error('Consumer options are null');
          this.log(error.message, 'error');
          throw error;
        }
        
        this.log('Consumer options received');
        
        try {
          const newConsumer = await consumerTransport.consume(consumerOptions);
          setConsumerCb(newConsumer);
          
          this.log(`Created consumer: ${newConsumer.id}`);
          
          const { track } = newConsumer;
          this.log(`Consumer track received: ${track.kind}`);
          
          // Create a MediaStream with the track from the consumer
          // Use proper type casting instead of @ts-expect-error
          const mediaTrack = track as unknown as MediaStreamTrack;
          const producerTrack = new MediaStream([mediaTrack]);
          
          this.log(`Media stream created with ${producerTrack.getTracks().length} tracks`);
          
          setMediaStreamCb(producerTrack);
          this.emitWithErrorHandling('consumer_resume', {});
        } catch (error) {
          this.log(`Error consuming: ${(error as Error).message}`, 'error');
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