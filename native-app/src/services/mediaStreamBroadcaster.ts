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
 * Callback type for producer creation success
 */
type ProducerSuccessCallback = ({ id }: { id: string }) => void;

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
    // Handler for RTP capabilities response
    const handleRtpCapabilities = ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities }) => {
      this.log('Router RTP Capabilities received');
      createDevice(rtpCapabilities).catch(err => {
        this.log(`Error creating device: ${err.message}`, 'error');
      });
    };

    this.emitWithErrorHandling(
      'create_room',
      {},
      handleRtpCapabilities
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
    // Define a named handler for the transport options callback
    const handleProducerTransportOptions = ({ transportOptions }: { transportOptions: any }) => {
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
              onTransportConnectSuccess: () => void,
              onTransportConnectError: (error: Error) => void
            ) => {
              try {
                // Signal local DTLS parameters to the server side transport
                this.emitWithErrorHandling('transport_connect', {
                  dtlsParameters,
                });
                onTransportConnectSuccess();
              } catch (error) {
                this.log(`Error in transport connect event: ${(error as Error).message}`, 'error');
                onTransportConnectError(error as Error);
              }
            }
          );

          // Handle transport produce event
          newProducerTransport.on(
            'produce',
            async (
              parameters: ProducerParameters,
              onProducerSuccess: ProducerSuccessCallback,
              onProducerError: (error: Error) => void
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
                    onProducerSuccess({ id });
                  }
                );
              } catch (err) {
                this.log(`Error in transport produce event: ${(err as Error).message}`, 'error');
                onProducerError(err as Error);
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
      };

      // Use the named handler
      this.emitWithErrorHandling(
        'createWebRtcTransport',
        { sender: true },
        handleProducerTransportOptions
      )
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
    // Define a named handler for the consumer transport options
    const handleConsumerTransportOptions = ({ transportOptions }: { transportOptions: any }) => {
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
            async (
              { dtlsParameters },
              onConsumerConnectSuccess,
              onConsumerConnectError
            ) => {
              try {
                // Signal local DTLS parameters to the server side transport
                this.emitWithErrorHandling('transport_recv_connect', {
                  dtlsParameters,
                });
                onConsumerConnectSuccess();
              } catch (error) {
                this.log(`Error in transport connect event: ${(error as Error).message}`, 'error');
                onConsumerConnectError(error as Error);
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
      };

      // Use the named handler
      this.emitWithErrorHandling(
        'createWebRtcTransport',
        { sender: false },
        handleConsumerTransportOptions
      )
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
    // Define handler for consumer options
    const handleConsumerOptions = async ({ consumerOptions }: { consumerOptions: any }) => {
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
      };

      // Use the named handler
      this.emitWithErrorHandling(
        'consume',
        { rtpCapabilities: device.rtpCapabilities },
        handleConsumerOptions
      )
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