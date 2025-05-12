import type { MediaSoupService } from "@/services/mediasoupService";
import type {
  BroadcastEmitEvents,
  BroadcastListenEvents,
} from "@/Types/BroadcastSocketTypes";
import type { Socket } from "socket.io";

export const peerSocketInit = (
  socket: Socket<BroadcastListenEvents, BroadcastEmitEvents>,
  mediaSoupService: MediaSoupService
) => {
  console.log(`New connection: ${socket.id}`);

  socket.data = {
    producerTransportId: "",
    consumerTransportId: "",
    producerId: "",
    consumerId: "",
  };

  /**
   * Wrap every async handler in try/catch + auto‐error‐callback
   */
  function onAsync<E extends keyof BroadcastListenEvents>(
    event: E,
    handler: (...args: Parameters<BroadcastListenEvents[E]>) => Promise<void>
  ) {
    const listener = async (...rawArgs: any[]) => {
      try {
        await handler(...(rawArgs as Parameters<BroadcastListenEvents[E]>));
      } catch (err: any) {
        console.error(`Error handling ${event}:`, err);
        const cb = rawArgs[rawArgs.length - 1];
        if (typeof cb === "function") {
          cb({ error: err.message ?? String(err) });
        }
      }
    };

    (socket as any).on(event, listener);
  }

 socket.emit("connection_success", {
    socketId: socket.id,
    producerAlreadyExists: false,
  });

  socket.on("disconnect", () => {
    console.log("Peer disconnected:", socket.id);

    const activeProducerId = mediaSoupService.getActiveProducer();
    if (socket.data.producerId && socket.data.producerId === activeProducerId) {
        console.log(`[SERVER] disconnect: Active producer ${activeProducerId} disconnected. Clearing activeProducerId.`);
        mediaSoupService.setActiveProducer(null);
    }
    mediaSoupService.cleanup(socket.id);
  });

  // ─── register all the rest via onAsync ────────────────────────────────

  onAsync("create_room", async (callback) => {
    const { rtpCapabilities } = await mediaSoupService.getOrCreateRouter();
    callback({ rtpCapabilities });
  });

  onAsync("getRtpCapabilities", async (callback) => {
    const { rtpCapabilities } = await mediaSoupService.getOrCreateRouter();
    callback({ rtpCapabilities });
  });

  onAsync("createWebRtcTransport", async ({ producer }, callback) => {
    const { transport, transportOptions } =
      await mediaSoupService.createTransport(socket.id, producer);
    if (producer) {
      socket.data.producerTransportId = transport.id;
    } else {
      socket.data.consumerTransportId = transport.id;
    }
    callback({ transportOptions });
  });

  onAsync("transport_connect", async ({ transportId, dtlsParameters }) => {
    if (!transportId) throw new Error("transportId is required for transport_connect");

    console.log(`Connecting transport ${transportId} for socket ${socket.id}`);
    await mediaSoupService.connectTransport(
      transportId,
      dtlsParameters
    );
  });

  onAsync(
    "transport_produce",
    async ({ transportId, kind, rtpParameters, appData }, callback) => {

      if (!transportId) throw new Error("transportId is required for transport_produce");

      const { id } = await mediaSoupService.createProducer(
        transportId,
        kind,
        rtpParameters,
        appData
      );
      socket.data.producerId = id;
      mediaSoupService.setActiveProducer(id);
      console.log(`[SERVER] transport_produce: Set activeProducerId to ${mediaSoupService.getActiveProducer()}`);
      callback({ id });
      socket.broadcast.emit("new_producer", { producerId: id });
    }
  );

  onAsync("transport_recv_connect", async ({ transportId, dtlsParameters }) => {
    if (!transportId) throw new Error("transportId is required for transport_recv_connect");
     console.log(`Connecting recv transport ${transportId} for socket ${socket.id}`);

    await mediaSoupService.connectTransport(
      transportId,
      dtlsParameters
    );
  });

  onAsync("consume", async ({ rtpCapabilities }, callback) => {

    const transportId = socket.data.consumerTransportId;
    if (!transportId) throw new Error("Consumer transport not found for this socket.");

    const producerToConsume = mediaSoupService.getActiveProducer();
    if (!producerToConsume) throw new Error("Producer not found or specified for consumption.");

    console.log(`Consuming producer ${producerToConsume} on transport ${transportId} for socket ${socket.id}`);
    const consumer = await mediaSoupService.createConsumer(
      transportId,
      producerToConsume,
      rtpCapabilities
    );
    if (!consumer) throw new Error("cannot_consume");
    socket.data.consumerId = consumer.id;
    callback({
      consumerOptions: {
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      },
    });
  });

  // If you ever add resumeConsumer later:
  // onAsync("consumer_resume", async (_, callback) => {
  //   await mediaSoupService.resumeConsumer(socket.data.consumerId);
  //   callback({ ok: true });
  // });
};
