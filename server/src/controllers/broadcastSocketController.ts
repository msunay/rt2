import type { Socket } from "socket.io";
import type { MediaSoupService } from "../services/mediasoupService";
import type {
  BroadcastEmitEvents,
  BroadcastListenEvents,
} from "../Types/BroadcastSocketTypes";

interface SocketData {
  peerId: string;
  producerTransportId?: string;
  consumerTransportId?: string;
  producerId?: string;
  consumerIds: Set<string>;
}

export class BroadcastSocketController {
  constructor(
    private socket: Socket<BroadcastListenEvents, BroadcastEmitEvents>,
    private mediaSoupService: MediaSoupService
  ) {
    this.socket.data = {
      peerId: socket.id,
      consumerIds: new Set(),
    } as SocketData;

    this.setupHandlers();
    this.emitConnectionSuccess();
  }

  private setupHandlers(): void {
    // Use typed event handlers
    this.socket.on("disconnect", this.handleDisconnect.bind(this));
    this.socket.on("create_room", this.handleCreateRoom.bind(this));
    this.socket.on("createWebRtcTransport", this.handleCreateTransport.bind(this));
    this.socket.on("transport_connect", this.handleTransportConnect.bind(this));
    this.socket.on("transport_recv_connect", this.handleTransportRecvConnect.bind(this));
    this.socket.on("transport_produce", this.handleTransportProduce.bind(this));
    this.socket.on("consume", this.handleConsume.bind(this));
    this.socket.on("consumer_resume", this.handleConsumerResume.bind(this));
  }

  private emitConnectionSuccess(): void {
    const activeProducer = this.mediaSoupService.getActiveProducer();

    this.socket.emit("connection_success", {
      socketId: this.socket.id,
      producerAlreadyExists: activeProducer !== null,
    });

    console.log(`Peer connected: ${this.socket.id}`);
  }

  private handleDisconnect(): void {
    console.log(`Peer disconnected: ${this.socket.id}`);

    // Clean up MediaSoup resources
    this.mediaSoupService.cleanup(this.socket.id);

    // Notify other peers if this was the active producer
    const activeProducer = this.mediaSoupService.getActiveProducer();
    if (activeProducer?.peerId === this.socket.id) {
      this.socket.broadcast.emit("producer_closed");
    }
  }

  private async handleCreateRoom(
    callback: (response: { rtpCapabilities: any } | { error: string }) => void
  ): Promise<void> {
    try {
      const rtpCapabilities = this.mediaSoupService.getRtpCapabilities();
      callback({ rtpCapabilities });
    } catch (error) {
      console.error("Error in create_room:", error);
      callback({ error: this.getErrorMessage(error) });
    }
  }

  private async handleCreateTransport(
    { producer }: { producer: boolean },
    callback: (response: { transportOptions: any } | { error: string }) => void
  ): Promise<void> {
    try {
      const transportOptions = await this.mediaSoupService.createTransport(
        this.socket.id,
        producer
      );

      // Store transport ID in socket data
      const data = this.socket.data as SocketData;
      if (producer) {
        data.producerTransportId = transportOptions.id;
      } else {
        data.consumerTransportId = transportOptions.id;
      }

      callback({ transportOptions });
    } catch (error) {
      console.error("Error creating transport:", error);
      callback({ error: this.getErrorMessage(error) });
    }
  }

  private async handleTransportConnect({
    transportId,
    dtlsParameters,
  }: {
    transportId: string;
    dtlsParameters: any;
  }): Promise<void> {
    try {
      await this.mediaSoupService.connectTransport(
        this.socket.id,
        transportId,
        dtlsParameters
      );
    } catch (error) {
      console.error("Error connecting transport:", error);
    }
  }

  private async handleTransportRecvConnect({
    transportId,
    dtlsParameters,
  }: {
    transportId: string;
    dtlsParameters: any;
  }): Promise<void> {
    try {
      await this.mediaSoupService.connectTransport(
        this.socket.id,
        transportId,
        dtlsParameters
      );
    } catch (error) {
      console.error("Error connecting recv transport:", error);
    }
  }

  private async handleTransportProduce(
    payload: any,
    callback: (response: { id: string } | { error: string }) => void
  ): Promise<void> {
    try {
      const { transportId, kind, rtpParameters, appData } = payload;

      if (!transportId) {
        throw new Error("transportId is required");
      }

      const producerId = await this.mediaSoupService.createProducer(
        this.socket.id,
        transportId,
        kind,
        rtpParameters,
        appData
      );

      this.socket.data.producerId = producerId;

      // Notify other peers about new producer
      this.socket.broadcast.emit("new_producer", { producerId });

      callback({ id: producerId });
    } catch (error) {
      console.error("Error creating producer:", error);
      callback({ error: this.getErrorMessage(error) });
    }
  }

  private async handleConsume(
    { rtpCapabilities }: { rtpCapabilities: any },
    callback: (response: { consumerOptions: any } | { error: string }) => void
  ): Promise<void> {
    try {
      const data = this.socket.data as SocketData;

      if (!data.consumerTransportId) {
        throw new Error("Consumer transport not created");
      }

      const result = await this.mediaSoupService.createConsumer(
        this.socket.id,
        data.consumerTransportId,
        rtpCapabilities
      );

      if (!result) {
        callback({ error: "Cannot consume - client capabilities insufficient" });
        return;
      }

      data.consumerIds.add(result.id);

      callback({
        consumerOptions: {
          id: result.id,
          producerId: result.producerId,
          kind: result.kind,
          rtpParameters: result.rtpParameters,
        },
      });
    } catch (error) {
      console.error("Error creating consumer:", error);
      callback({ error: this.getErrorMessage(error) });
    }
  }

  private async handleConsumerResume({ consumerId }: { consumerId: string }): Promise<void> {
    try {
      await this.mediaSoupService.resumeConsumer(this.socket.id, consumerId);
    } catch (error) {
      console.error("Error resuming consumer:", error);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}