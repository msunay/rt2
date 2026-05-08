import { createWorker } from "mediasoup";
import type { TransportOptions } from "mediasoup-client/types";
import type {
  Consumer,
  MediaKind,
  Producer,
  Router,
  RouterOptions,
  WebRtcServer,
  WebRtcServerOptions,
  WebRtcTransport,
  Worker,
  WorkerSettings,
  DtlsParameters,
  RtpCapabilities,
  RtpParameters,
  AppData,
} from "mediasoup/types";

export interface MediaSoupServiceConfig {
  worker: WorkerSettings;
  webRtcServerOptions: WebRtcServerOptions;
  router: RouterOptions;
}

interface PeerResources {
  producerTransport?: WebRtcTransport;
  consumerTransport?: WebRtcTransport;
  producer?: Producer;
  consumers: Map<string, Consumer>;
}

export class MediaSoupService {
  private worker: Worker | null = null;
  private webRtcServer: WebRtcServer | null = null;
  private router: Router | null = null;

  // Track resources by peer ID
  private peers = new Map<string, PeerResources>();

  // Track the current active producer (for single-producer scenarios)
  private activeProducerId: string | null = null;
  private activeProducerPeerId: string | null = null;

  constructor(private config: MediaSoupServiceConfig) {}

  public async initialize(): Promise<void> {
    this.worker = await this.createWorker();
    this.webRtcServer = await this.createWebRtcServer(this.worker);
    this.router = await this.createRouter();
  }

  private async createWorker(): Promise<Worker> {
    const worker = await createWorker({
      logLevel: this.config.worker.logLevel,
      logTags: this.config.worker.logTags,
    });

    console.log(`MediaSoup worker created with pid: ${worker.pid}`);

    worker.on("died", (error) => {
      console.error("MediaSoup worker died", error);
      setTimeout(() => process.exit(1), 2000);
    });

    return worker;
  }

  private async createWebRtcServer(worker: Worker): Promise<WebRtcServer> {
    try {
      return await worker.createWebRtcServer(this.config.webRtcServerOptions);
    } catch (error) {
      console.error("Failed to create WebRTC server:", error);
      throw error;
    }
  }

  private async createRouter(): Promise<Router> {
    if (!this.worker) {
      throw new Error("Worker not initialized");
    }

    const router = await this.worker.createRouter({
      mediaCodecs: this.config.router.mediaCodecs,
    });

    console.log(`Created router with ID: ${router.id}`);
    return router;
  }

  public getRtpCapabilities(): RtpCapabilities {
    if (!this.router) {
      throw new Error("Router not initialized");
    }
    return this.router.rtpCapabilities;
  }

  private ensurePeerResources(peerId: string): PeerResources {
    if (!this.peers.has(peerId)) {
      this.peers.set(peerId, {
        consumers: new Map(),
      });
    }
    return this.peers.get(peerId)!;
  }

  public async createTransport(
    peerId: string,
    isProducer: boolean
  ): Promise<TransportOptions> {
    if (!this.webRtcServer || !this.router) {
      throw new Error("WebRtcServer or Router not initialized");
    }

    const transport = await this.router.createWebRtcTransport({
      webRtcServer: this.webRtcServer,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    // Store transport in peer resources
    const peerResources = this.ensurePeerResources(peerId);
    if (isProducer) {
      peerResources.producerTransport = transport;
    } else {
      peerResources.consumerTransport = transport;
    }

    // Set up transport event handlers
    transport.on("dtlsstatechange", (dtlsState) => {
      console.log(`Transport ${transport.id} DTLS state changed to ${dtlsState}`);
      if (dtlsState === "closed") {
        transport.close();
      }
    });

    transport.on('icestatechange', (iceState) => {
    console.log(`Transport ${transport.id} ICE state changed to: ${iceState}`);
    if (iceState === 'disconnected') {
      console.error(`Transport ${transport.id} ICE ${iceState}!`);
      transport.close();
    }
  });

    transport.on("@close", () => {
      console.log(`Transport ${transport.id} closed for peer ${peerId}`);
    });

    // Return transport options for client
    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  public async connectTransport(
    peerId: string,
    transportId: string,
    dtlsParameters: DtlsParameters
  ): Promise<void> {
    const peerResources = this.peers.get(peerId);
    if (!peerResources) {
      throw new Error(`No resources found for peer ${peerId}`);
    }

    // Find the transport (could be producer or consumer)
    const transport =
      (peerResources.producerTransport?.id === transportId ? peerResources.producerTransport : null) ||
      (peerResources.consumerTransport?.id === transportId ? peerResources.consumerTransport : null);

    if (!transport) {
      throw new Error(`Transport ${transportId} not found for peer ${peerId}`);
    }

    await transport.connect({ dtlsParameters });
    console.log(`Transport ${transportId} connected for peer ${peerId}`);
  }

  public async createProducer(
    peerId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
    appData: AppData = {}
  ): Promise<string> {
    const peerResources = this.peers.get(peerId);
    if (!peerResources?.producerTransport) {
      throw new Error(`Producer transport not found for peer ${peerId}`);
    }

    if (peerResources.producerTransport.id !== transportId) {
      throw new Error(`Transport ID mismatch for peer ${peerId}`);
    }

    // Close existing producer if any
    if (peerResources.producer) {
      console.log(`Closing existing producer for peer ${peerId}`);
      peerResources.producer.close();
    }

    const producer = await peerResources.producerTransport.produce({
      kind,
      rtpParameters,
      appData,
    });

    peerResources.producer = producer;

    // Update active producer
    this.activeProducerId = producer.id;
    this.activeProducerPeerId = peerId;

    console.log(`Created producer ${producer.id} for peer ${peerId}`);

    producer.on("transportclose", () => {
      console.log(`Producer ${producer.id} transport closed`);
      if (this.activeProducerId === producer.id) {
        this.activeProducerId = null;
        this.activeProducerPeerId = null;
      }
    });

    return producer.id;
  }

  public async createConsumer(
    peerId: string,
    transportId: string,
    rtpCapabilities: RtpCapabilities
  ): Promise<{
    id: string;
    producerId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
  } | null> {
    if (!this.router) {
      throw new Error("Router not initialized");
    }

    const peerResources = this.peers.get(peerId);
    if (!peerResources?.consumerTransport) {
      throw new Error(`Consumer transport not found for peer ${peerId}`);
    }

    if (peerResources.consumerTransport.id !== transportId) {
      throw new Error(`Transport ID mismatch for peer ${peerId}`);
    }

    // Find the active producer
    if (!this.activeProducerId || !this.activeProducerPeerId) {
      throw new Error("No active producer available");
    }

    const producerPeer = this.peers.get(this.activeProducerPeerId);
    if (!producerPeer?.producer) {
      throw new Error("Active producer not found");
    }

    const producer = producerPeer.producer;

    // Check if client can consume
    if (!this.router.canConsume({
      producerId: producer.id,
      rtpCapabilities
    })) {
      console.warn(`Client ${peerId} cannot consume producer ${producer.id}`);
      return null;
    }

    // Create consumer
    const consumer = await peerResources.consumerTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: true, // Start paused
    });

    peerResources.consumers.set(consumer.id, consumer);

    // Set up consumer event handlers
    consumer.on("transportclose", () => {
      console.log(`Consumer ${consumer.id} transport closed`);
      peerResources.consumers.delete(consumer.id);
    });

    consumer.on("producerclose", () => {
      console.log(`Producer for consumer ${consumer.id} closed`);
      peerResources.consumers.delete(consumer.id);
    });

    console.log(`Created consumer ${consumer.id} for peer ${peerId}`);

    return {
      id: consumer.id,
      producerId: consumer.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  public async resumeConsumer(peerId: string, consumerId: string): Promise<void> {
    const peerResources = this.peers.get(peerId);
    if (!peerResources) {
      throw new Error(`No resources found for peer ${peerId}`);
    }

    const consumer = peerResources.consumers.get(consumerId);
    if (!consumer) {
      throw new Error(`Consumer ${consumerId} not found for peer ${peerId}`);
    }

    await consumer.resume();
    console.log(`Resumed consumer ${consumerId} for peer ${peerId}`);
  }

  public getActiveProducer(): { producerId: string; peerId: string } | null {
    if (!this.activeProducerId || !this.activeProducerPeerId) {
      return null;
    }
    return {
      producerId: this.activeProducerId,
      peerId: this.activeProducerPeerId,
    };
  }

  public cleanup(peerId: string): void {
    const peerResources = this.peers.get(peerId);
    if (!peerResources) return;

    // Close all consumers
    peerResources.consumers.forEach((consumer) => {
      consumer.close();
    });

    // Close producer if exists
    if (peerResources.producer) {
      peerResources.producer.close();

      // Clear active producer if it matches
      if (this.activeProducerId === peerResources.producer.id) {
        this.activeProducerId = null;
        this.activeProducerPeerId = null;
      }
    }

    // Close transports
    peerResources.producerTransport?.close();
    peerResources.consumerTransport?.close();

    // Remove peer from map
    this.peers.delete(peerId);

    console.log(`Cleaned up resources for peer ${peerId}`);
  }

  public async close(): Promise<void> {
    // Clean up all peers
    this.peers.forEach((_, peerId) => {
      this.cleanup(peerId);
    });

    // Close router
    this.router?.close();

    // Close worker
    this.worker?.close();

    console.log("MediaSoup service closed");
  }
}
