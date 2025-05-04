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
} from "mediasoup/types";

interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface MediaSoupServiceConfig {
  worker: WorkerSettings;
  webRtcServerOptions: WebRtcServerOptions;
  router: RouterOptions;
  iceServers?: RTCIceServer[];
}

export class MediaSoupService {
  private worker: Worker | null = null;
  private webRtcServer: WebRtcServer | null = null;
  private router: Router | null = null;
  private rooms = new Map<
    string,
    {
      router: Router;
      producers: Map<string, Producer>;
      consumers: Map<string, Consumer>;
    }
  >();
  private transports = new Map<string, WebRtcTransport>();

  constructor(private config: MediaSoupServiceConfig) {}

  public async initialize(): Promise<void> {
    this.worker = await this.createWorker();
    this.webRtcServer = await this.createWebRtcServer(this.worker);
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

  public async getOrCreateRouter(): Promise<Router> {
    if (!this.worker) {
      throw new Error("Worker not initialized");
    }

    if (!this.router) {
      this.router = await this.worker.createRouter({
        mediaCodecs: this.config.router.mediaCodecs,
      });
      console.log(`Created router with ID: ${this.router.id}`);
    }

    return this.router;
  }

  public async createTransport(
    peerId: string,
    isProducer: boolean
  ): Promise<{
    transport: WebRtcTransport;
    transportOptions: TransportOptions;
  }> {
    if (!this.webRtcServer || !this.router) {
      throw new Error(`${!this.webRtcServer ? 'WebRtcServer' : 'Router'} not initialized`);
    }

    const transport = await this.router.createWebRtcTransport({
      webRtcServer: this.webRtcServer,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    this.transports.set(transport.id, transport);

    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "closed") {
        transport.close();
        this.transports.delete(transport.id);
      }
    });

    transport.on("@close", () => {
      console.log(`Transport ${transport.id} closed`);
      this.transports.delete(transport.id);
    });

    const transportOptions = {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };

    return { transport, transportOptions };
  }

  public async connectTransport(
    transportId: string,
    dtlsParameters: any
  ): Promise<void> {
    const transport = this.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport with id ${transportId} not found`);
    }

    await transport.connect({ dtlsParameters });
  }

  public async createProducer(
    transportId: string,
    kind: MediaKind,
    rtpParameters: any,
    appData: any = {}
  ): Promise<Producer> {
    const transport = this.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport with id ${transportId} not found`);
    }

    const producer = await transport.produce({
      kind,
      rtpParameters,
      appData,
    });

    producer.on("transportclose", () => {
      console.log(`Producer ${producer.id} transport closed`);
    });

    return producer;
  }

  public async createConsumer(
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: any
  ): Promise<Consumer | null> {
    if (!this.router) {
      throw new Error("Router not initialized");
    }

    // Check if the client can consume the producer
    if (!this.router.canConsume({ producerId, rtpCapabilities })) {
      console.warn("Client cannot consume the producer");
      return null;
    }

    const transport = this.transports.get(consumerTransportId);
    if (!transport) {
      throw new Error(`Transport with id ${consumerTransportId} not found`);
    }

    try {
      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: true, // Start paused, then resume after client is ready
      });

      consumer.on("transportclose", () => {
        console.log(`Consumer ${consumer.id} transport closed`);
      });

      consumer.on("producerclose", () => {
        console.log(`Producer of consumer ${consumer.id} closed`);
      });

      return consumer;
    } catch (error) {
      console.error("Error creating consumer:", error);
      return null;
    }
  }
  /*
    public async resumeConsumer(consumerId: string): Promise<void> {
      // Find the consumer by ID (would need to track consumers)
      const consumer = this.findConsumer(consumerId);
      if (consumer) {
        await consumer.resume();
      }
    }

    private findConsumer(consumerId: string): Consumer | null {
      // Implementation depends on how we track consumers
      return null;
    }

    public closeTransport(transportId: string): void {
      const transport = this.transports.get(transportId);
      if (transport) {
        transport.close();
        this.transports.delete(transportId);
      }
    }

    */
  public cleanup(peerId: string): void {
    // Close all resources associated with this peer
  }
}
