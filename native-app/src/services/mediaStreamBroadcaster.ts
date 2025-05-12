import { WebSocketManager } from '@/src/services/webSocketManager';
import {
    AppData,
    Consumer,
    ConsumerOptions,
    Device,
    DtlsParameters,
    MediaKind,
    RtpCapabilities,
    RtpParameters,
    Transport,
    TransportOptions,
} from 'mediasoup-client/types';
import { MediaStream, MediaStreamTrack } from 'react-native-webrtc';

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
        this.addListener(
            'connection_success',
            ({ socketId, producerAlreadyExists }) => {
                this.log(`Streaming host socket connected: ${socketId}, producer exists: ${producerAlreadyExists}`);
            },
            'Streaming host connection'
        );
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
    public setupProducerClosedListener(consumerTransport: Transport<AppData>, consumer: Consumer<AppData>): void {
        this.addListener(
            'producer_closed',
            () => {
                // Server notified when producer is closed
                try {
                    consumer.close();
                    consumerTransport.close();
                } catch (error) {
                    this.log(`Error closing consumer and transport: ${(error as Error).message}`, 'error');
                }
            },
            'Producer closed'
        );
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
    public createRoom(createDevice: (rtpCapabilities: RtpCapabilities) => Promise<void>): void {
        this.getSocket().emit('create_room', async ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities }) => {
            this.log('Router RTP Capabilities received');
            try {
                await createDevice(rtpCapabilities);
                this.log('Device created with RTP capabilities');
            } catch (error) {
                this.log(`Error creating device: ${error}`, 'error');
            }
        });
    }

    /**
     * Creates a producer WebRTC transport
     * @param onTransportReady Function to set the producer transport
     * @param device Mediasoup device
     */
    public createProducerTransport(onTransportReady: (transport: Transport<AppData>) => void, device: Device): void {
        this.getSocket().emit(
            'createWebRtcTransport',
            { producer: true },
            ({ transportOptions }: { transportOptions: TransportOptions }) => {
                if (!transportOptions) {
                    const error = new Error('Transport options are null');
                    this.log(error.message, 'error');
                    throw error;
                }

                this.log('Producer transport options received');

                try {
                    const newProducerTransport = device.createSendTransport(transportOptions);
                    this.log(`Created send transport: ${newProducerTransport.id}`);

                    // Handle transport connect event
                    newProducerTransport.on(
                        'connect',
                        async (
                            { dtlsParameters }: { dtlsParameters: DtlsParameters },
                            onSuccess: () => void,
                            onError: (error: Error) => void
                        ) => {
                            try {
                                this.log('Producer transport "connect" event: Emitting transport_connect');
                                this.getSocket().emit('transport_connect', {
                                    transportId: newProducerTransport.id,
                                    dtlsParameters,
                                });
                                onSuccess();
                            } catch (error) {
                                this.log(`Error in transport connect event: ${(error as Error).message}`, 'error');
                                onError(error as Error);
                            }
                        }
                    );

                    // Handle transport produce event
                    newProducerTransport.on(
                        'produce',
                        async (
                            parameters: ProducerParameters,
                            onSuccess: ProducerSuccessCallback,
                            onError: (error: Error) => void
                        ) => {
                            this.log(`Producer parameters received: ${parameters.kind}`);

                            try {
                                this.getSocket().emit(
                                    'transport_produce',
                                    {
                                        transportId: newProducerTransport.id,
                                        kind: parameters.kind,
                                        rtpParameters: parameters.rtpParameters,
                                        appData: parameters.appData,
                                    },
                                    ({ id }) => {
                                        onSuccess({ id });
                                    }
                                );
                            } catch (err) {
                                this.log(`Error in transport produce event: ${(err as Error).message}`, 'error');
                                onError(err as Error);
                            }
                        }
                    );
                    onTransportReady(newProducerTransport);
                    this.log('PRODUCER CLIENT: Transport fully set up, onTransportReadyCb called.');
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
     */
    public createConsumerTransport(
        setConsumerTransportCb: (transport: Transport<AppData>) => void,
        device: Device
    ): void {
        this.getSocket().emit(
            'createWebRtcTransport',
            { producer: false },
            ({ transportOptions }: { transportOptions: TransportOptions }) => {
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

                    newConsumerTransport.on(
                        'connect',
                        async (
                            { dtlsParameters }: { dtlsParameters: DtlsParameters },
                            onSuccess: () => void,
                            onError: (error: Error) => void
                        ) => {
                            this.log(`CLIENT: Consumer transport "connect" event fired. DTLS: ${dtlsParameters}`);
                            try {
                                this.log('CLIENT: Emitting "transport_recv_connect" to server...');
                                this.getSocket().emit('transport_recv_connect', {
                                    transportId: newConsumerTransport.id,
                                    dtlsParameters,
                                });

                                this.log('CLIENT: "transport_recv_connect" emitted. Calling onSuccess().');
                                onSuccess();
                            } catch (error) {
                                this.log(`Error in transport connect event: ${(error as Error).message}`, 'error');
                                onError(error as Error);
                            }
                        }
                    );
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
     */
    public consume(
        consumerTransport: Transport<AppData>,
        device: Device,
        setConsumerCb: (consumer: Consumer<AppData>) => void,
        setMediaStreamCb: (mediaStream: MediaStream) => void
    ): void {
        this.getSocket().emit(
            'consume',
            { rtpCapabilities: device.rtpCapabilities },
            async ({ consumerOptions }: { consumerOptions: ConsumerOptions }) => {
                if (!consumerOptions) {
                    console.error('Consumer options', consumerOptions);
                    const error = new Error('Consumer options are null');
                    this.log(error.message, 'error');
                    throw error;
                }

                this.log('Consumer options received');

                try {
                    const newConsumer = await consumerTransport.consume(consumerOptions);
                    setConsumerCb(newConsumer);

                    this.log(`Created client-side consumer: ${newConsumer.id}`);
                    const { track } = newConsumer;
                    this.log(`Consumer track received: ${track.kind}, id: ${track.id}`);

                    // Create a MediaStream with the track from the consumer
                    const mediaTrack = track as unknown as MediaStreamTrack;
                    const producerTrack = new MediaStream([mediaTrack]);
                    setMediaStreamCb(producerTrack);

                    this.log(`Media stream created with ${producerTrack.getTracks().length} tracks`);

                    this.getSocket().emit('consumer_resume');
                } catch (error) {
                    this.log(`Error consuming: ${(error as Error).message}`, 'error');
                }
            }
        );
    }

    /**
     * Create Redux-compatible versions of the methods
     */
    // public createConsumerTransportWithRedux(
    //   dispatch: AppDispatch,
    //   device: Device,
    //   connectRecvTransport: (
    //     consumerTransport: Transport<AppData>,
    //     device: Device
    //   ) => Promise<void>
    // ): void {
    //   this.createConsumerTransport(
    //     (transport) => dispatch(setConsumerTransport(transport)),
    //     device,
    //     // connectRecvTransport
    //   );
    // }

    public consumeAndManageStream(
        consumerTransport: Transport<AppData>,
        device: Device,
        handleConsumerObjectCb: (consumer: Consumer<AppData>) => void,
        handleReceivedStreamCb: (mediaStream: MediaStream) => void
    ): void {
        this.consume(consumerTransport, device, handleConsumerObjectCb, handleReceivedStreamCb);
    }
}
