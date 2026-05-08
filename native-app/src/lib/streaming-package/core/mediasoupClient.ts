import { Logger, LogLevel } from '@/src/utils/logger';
import {
    Consumer,
    ConsumerOptions,
    Device,
    Producer,
    ProducerOptions,
    RtpCapabilities,
    Transport,
    TransportOptions,
} from 'mediasoup-client/types';
import { MediaStream } from 'react-native-webrtc';
import { SocketManager } from './socketManager';
import { StreamingConfiguration } from './stremingConfig';
import {
    ConnectionState,
    IStreamingProvider,
    StreamingConfig,
    StreamingEvents,
    StreamingRole,
    StreamingState,
    StreamingStats,
} from './types';
import { toMediasoupTrack, toRNMediaStreamTrack } from './utils';

export class MediaSoupClient extends Logger implements IStreamingProvider {
    private state: StreamingState = {
        connectionState: ConnectionState.IDLE,
        isStreaming: false,
        error: null,
    };

    private device: Device | null = null;
    private producerTransport: Transport | null = null;
    private consumerTransport: Transport | null = null;
    private producer: Producer | null = null;
    private consumer: Consumer | null = null;

    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;

    private eventEmitter: Map<keyof StreamingEvents, Set<Function>> = new Map();
    private socketManager: SocketManager;
    private statsInterval: number | null = null;

    constructor(private config: StreamingConfig) {
        super('MediaSoupClient', { minLevel: LogLevel.DEBUG });

        if (config.useIce) {
            StreamingConfiguration.validateConfig(config);
        }
        this.config = config;

        const serverUrl = process.env.EXPO_PUBLIC_SERVER_IP || '';
        this.logInfo('Using server URL:', serverUrl);
        this.socketManager = new SocketManager('mediasoup', serverUrl);
    }

    async connect(): Promise<void> {
        try {
            this.updateState({ connectionState: ConnectionState.CONNECTING });

            // Connect socket
            this.socketManager.connect();

            // Wait for socket connection
            await this.waitForSocketConnection();

            // Setup socket event handlers
            this.setupSocketHandlers();

            // Initialize MediaSoup device
            await this.initializeDevice();

            this.updateState({ connectionState: ConnectionState.CONNECTED });
            this.logInfo('Connected to MediaSoup server');
            this.logInfo('Connection state:', this.state.connectionState);
        } catch (error) {
            this.handleError(error as Error);
            throw error;
        }
    }

    disconnect(): void {
        this.stopStatsCollection();

        if (this.producer) {
            this.producer.close();
            this.producer = null;
        }

        if (this.consumer) {
            this.consumer.close();
            this.consumer = null;
        }

        if (this.producerTransport) {
            this.producerTransport.close();
            this.producerTransport = null;
        }

        if (this.consumerTransport) {
            this.consumerTransport.close();
            this.consumerTransport = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        this.remoteStream = null;
        this.device = null;

        this.socketManager.disconnect();

        this.updateState({
            connectionState: ConnectionState.DISCONNECTED,
            isStreaming: false,
            localStream: undefined,
            remoteStream: undefined,
        });
    }

    async startProducing(stream: MediaStream): Promise<void> {
        this.logDebug('Starting production...');
        if (this.config.role !== StreamingRole.PRODUCER) {
            throw new Error('Client is not configured as a producer');
        }

        if (!this.device) {
            throw new Error('Device not initialized. Call connect() first');
        }

        if (this.producer) {
            this.logWarn('Already producing');
            return;
        }

        this.localStream = stream;

        try {
            // Create producer transport if not exists
            if (!this.producerTransport) {
                await this.createProducerTransport({ useIce: this.config.useIce });
            }

            // Get video track
            const videoTrack = stream.getVideoTracks()[0];
            if (!videoTrack) {
                throw new Error('No video track found in stream');
            }

            // Produce
            const params: ProducerOptions = {
                track: toMediasoupTrack(videoTrack),
                ...StreamingConfiguration.getEncodingParams(),
            };

            this.logDebug('Producing video track:', videoTrack);
            this.producer = await this.producerTransport!.produce(params);

            this.setupProducerHandlers();

            this.updateState({
                isStreaming: true,
                localStream: stream,
            });

            this.emit('onLocalStreamReady', stream);
            this.startStatsCollection();
        } catch (error) {
            this.handleError(error as Error);
            throw error;
        }
    }

    stopProducing(): void {
        if (this.producer) {
            this.producer.close();
            this.producer = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        this.updateState({
            isStreaming: false,
            localStream: undefined,
        });

        this.stopStatsCollection();
    }

    async startConsuming(): Promise<void> {
        if (this.config.role !== StreamingRole.CONSUMER) {
            throw new Error('Client is not configured as a consumer');
        }

        if (!this.device) {
            throw new Error('Device not initialized. Call connect() first');
        }

        if (this.consumer) {
            console.warn('Already consuming');
            return;
        }

        try {
            // Create consumer transport if not exists
            if (!this.consumerTransport) {
                await this.createConsumerTransport({ useIce: this.config.useIce });
            }

            // Request to consume
            const consumerOptions = await this.socketManager.emit<{ consumerOptions: ConsumerOptions }>('consume', {
                rtpCapabilities: this.device.rtpCapabilities,
            });

            if (!consumerOptions.consumerOptions) {
                throw new Error('Failed to get consumer options from server');
            }

            // Consume
            this.consumer = await this.consumerTransport!.consume(consumerOptions.consumerOptions);

            // Create media stream from track
            const track = toRNMediaStreamTrack(this.consumer.track);
            this.remoteStream = new MediaStream([track]);

            // Resume consumer
            await this.socketManager.emit('consumer_resume', { consumerId: this.consumer.id });

            this.setupConsumerHandlers();

            this.updateState({
                isStreaming: true,
                remoteStream: this.remoteStream,
            });

            this.emit('onRemoteStreamReady', this.remoteStream);
            this.startStatsCollection();
        } catch (error) {
            this.handleError(error as Error);
            throw error;
        }
    }

    stopConsuming(): void {
        if (this.consumer) {
            this.consumer.close();
            this.consumer = null;
        }

        this.remoteStream = null;

        this.updateState({
            isStreaming: false,
            remoteStream: undefined,
        });

        this.stopStatsCollection();
    }

    getState(): StreamingState {
        return { ...this.state };
    }

    on<K extends keyof StreamingEvents>(event: K, handler: StreamingEvents[K]): void {
        if (!this.eventEmitter.has(event)) {
            this.eventEmitter.set(event, new Set());
        }
        this.eventEmitter.get(event)!.add(handler as Function);
    }

    off<K extends keyof StreamingEvents>(event: K, handler?: StreamingEvents[K]): void {
        if (handler) {
            this.eventEmitter.get(event)?.delete(handler as Function);
        } else {
            this.eventEmitter.delete(event);
        }
    }

    // Private methods

    private async waitForSocketConnection(): Promise<void> {
        const maxAttempts = 50; // 5 seconds
        let attempts = 0;

        this.logInfo('Waiting for socket connection...');
        while (!this.socketManager.isConnected() && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            this.logInfo(`Attempt ${attempts + 1} of ${maxAttempts}`);
            attempts++;
        }

        if (!this.socketManager.isConnected()) {
            throw new Error('Failed to connect to socket server');
        }
        this.logInfo('Socket connected');
    }

    private async initializeDevice(): Promise<void> {
        const response = await this.socketManager.emit<{ rtpCapabilities: RtpCapabilities }>('create_room');

        if (!response?.rtpCapabilities) {
            throw new Error('Failed to get RTP capabilities from server');
        }

        this.device = new Device();
        await this.device.load({
            routerRtpCapabilities: response.rtpCapabilities,
        });

        this.logInfo('Device initialized:', {
            canProduceVideo: this.device.canProduce('video'),
            canProduceAudio: this.device.canProduce('audio'),
        });
    }

    private async createProducerTransport({ useIce }: { useIce: boolean }): Promise<void> {
        this.logDebug('Creating producer transport...');
        if (!this.device) throw new Error('Device not initialized');

        const { transportOptions } = await this.socketManager.emit<{ transportOptions: TransportOptions }>(
            'createWebRtcTransport',
            { producer: true }
        );

        if (!transportOptions) {
            throw new Error('Failed to get transport options from server');
        }

        if (this.config.useIce && !this.config.turnCredentials) {
            throw new Error('TURN credentials not provided');
        }

        if (useIce && this.config.turnCredentials) {
            const iceServers = StreamingConfiguration.getIceServers(this.config.turnCredentials);
            this.producerTransport = this.device.createSendTransport({
                ...transportOptions,
                iceServers,
            });
        } else {
            this.producerTransport = this.device.createSendTransport({
                ...transportOptions,
            });
        }

        this.setupProducerTransportHandlers();
    }

    private async createConsumerTransport({ useIce }: { useIce: boolean }): Promise<void> {
        if (!this.device) throw new Error('Device not initialized');

        const { transportOptions } = await this.socketManager.emit<{ transportOptions: TransportOptions }>(
            'createWebRtcTransport',
            { producer: false }
        );

        if (!transportOptions) {
            throw new Error('Failed to get transport options from server');
        }

        if (!this.config.turnCredentials) {
            throw new Error('TURN credentials not provided');
        }

        const iceServers = StreamingConfiguration.getIceServers(this.config.turnCredentials);
        if (useIce) {
            this.consumerTransport = this.device.createRecvTransport({
                ...transportOptions,
                iceServers,
            });
        } else {
            this.consumerTransport = this.device.createRecvTransport({
                ...transportOptions,
            });
        }

        this.setupConsumerTransportHandlers();
    }

    private setupProducerTransportHandlers(): void {
        if (!this.producerTransport) return;

        this.producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await this.socketManager.emit('transport_connect', {
                    transportId: this.producerTransport!.id,
                    dtlsParameters,
                });
                callback();
            } catch (error) {
                errback(error as Error);
            }
        });

        this.producerTransport.on('produce', async (parameters, callback, errback) => {
            try {
                const { id } = await this.socketManager.emit<{ id: string }>('transport_produce', {
                    transportId: this.producerTransport!.id,
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                });

                callback({ id });
            } catch (error) {
                errback(error as Error);
            }
        });

        this.producerTransport.on('connectionstatechange', (state) => {
            this.logInfo('Producer transport connection state:', state);
            if (state === 'failed') {
                this.handleError(new Error('Producer transport connection failed'));
            }
        });
    }

    private setupConsumerTransportHandlers(): void {
        if (!this.consumerTransport) return;

        this.consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                await this.socketManager.emit('transport_recv_connect', {
                    transportId: this.consumerTransport!.id,
                    dtlsParameters,
                });
                callback();
            } catch (error) {
                errback(error as Error);
            }
        });

        this.consumerTransport.on('connectionstatechange', (state) => {
            this.logInfo('Consumer transport connection state:', state);
            if (state === 'failed') {
                this.handleError(new Error('Consumer transport connection failed'));
            }
        });
    }

    private setupProducerHandlers(): void {
        if (!this.producer) return;

        this.producer.on('trackended', () => {
            this.logInfo('Producer track ended');
            this.stopProducing();
        });

        this.producer.on('transportclose', () => {
            this.logInfo('Producer transport closed');
            this.producer = null;
            this.emit('onProducerClosed');
        });
    }

    private setupConsumerHandlers(): void {
        if (!this.consumer) return;

        this.consumer.on('trackended', () => {
            this.logInfo('Consumer track ended');
            this.stopConsuming();
        });

        this.consumer.on('transportclose', () => {
            this.logInfo('Consumer transport closed');
            this.consumer = null;
            this.emit('onConsumerClosed');
        });
    }

    private setupSocketHandlers(): void {
        this.socketManager.on('producer_closed', () => {
            this.logInfo('Producer closed by server');
            this.stopConsuming();
            this.emit('onProducerClosed');
        });
    }

    private startStatsCollection(): void {
        this.logDebug('Starting stats collection...');
        if (this.statsInterval) return;

        this.statsInterval = setInterval(async () => {
            const stats = await this.collectStats();
            if (stats) {
                this.logDebug('Collected stats:', stats);
                this.emit('onStats', stats);
            }
        }, 5000);
    }

    private stopStatsCollection(): void {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
    }

    private async collectStats(): Promise<Partial<RTCOutboundRtpStreamStats> | Partial<RTCInboundRtpStreamStats> | null> {
        try {
            const stats: Partial<RTCOutboundRtpStreamStats> | Partial<RTCInboundRtpStreamStats> = {};

            if (this.producer) {
                const producerStats = await this.producer.getStats();
                producerStats.forEach((report) => {
                    if (report.type === 'outbound-rtp') {
                        if (report.kind === 'video') {
                            (stats as Partial<RTCOutboundRtpStreamStats>).bytesSent = report.bytesSent;
                            (stats as Partial<RTCOutboundRtpStreamStats>).packetsSent = report.packetsSent;

                            (stats as Partial<RTCOutboundRtpStreamStats>).framesSent = report.framesSent;
                            (stats as Partial<RTCOutboundRtpStreamStats>).framesPerSecond = report.framesPerSecond; // Or framesEncoded/s
                            (stats as Partial<RTCOutboundRtpStreamStats>).frameWidth = report.frameWidth;
                            (stats as Partial<RTCOutboundRtpStreamStats>).frameHeight = report.frameHeight;
                        }
                    }
                });
            }

            if (this.consumer) {
                const consumerStats = await this.consumer.getStats();
                consumerStats.forEach((report) => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        (stats as Partial<RTCInboundRtpStreamStats>).bytesReceived = report.bytesReceived;
                        (stats as Partial<RTCInboundRtpStreamStats>).packetsReceived = report.packetsReceived;
                        (stats as Partial<RTCInboundRtpStreamStats>).jitter = report.jitter;
                        (stats as Partial<RTCInboundRtpStreamStats>).packetsLost = report.packetsLost;

                        (stats as Partial<RTCInboundRtpStreamStats>).framesReceived = report.framesReceived;
                        (stats as Partial<RTCInboundRtpStreamStats>).framesPerSecond = report.framesPerSecond; // Or framesDecoded/s
                        (stats as Partial<RTCInboundRtpStreamStats>).frameWidth = report.frameWidth;
                        (stats as Partial<RTCInboundRtpStreamStats>).frameHeight = report.frameHeight;
                    }
                });
            }

            return stats;
        } catch (error) {
            this.logError('Error collecting stats:', error);
            return null;
        }
    }

    private updateState(updates: Partial<StreamingState>): void {
        this.state = { ...this.state, ...updates };

        if (updates.connectionState !== undefined) {
            this.emit('onConnectionStateChange', updates.connectionState);
        }
    }

    private handleError(error: Error): void {
        this.logError('MediaSoup client error:', error);
        this.updateState({
            error,
            connectionState: ConnectionState.FAILED,
        });
        this.emit('onError', error);
    }

    private emit<K extends keyof StreamingEvents>(
        event: K,
        ...args: Parameters<NonNullable<StreamingEvents[K]>>
    ): void {
        this.eventEmitter.get(event)?.forEach((handler) => {
            try {
                (handler as Function)(...args);
            } catch (error) {
                this.logError(`Error in event handler for ${event}:`, error);
            }
        });
    }
}
