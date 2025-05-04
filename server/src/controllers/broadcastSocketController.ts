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

  onAsync("transport_connect", async ({ dtlsParameters }) => {
    await mediaSoupService.connectTransport(
      socket.data.producerTransportId,
      dtlsParameters
    );
  });

  onAsync(
    "transport_produce",
    async ({ kind, rtpParameters, appData }, callback) => {
      const { id } = await mediaSoupService.createProducer(
        socket.data.producerTransportId,
        kind,
        rtpParameters,
        appData
      );
      socket.data.producerId = id;
      callback({ id });
      socket.broadcast.emit("new_producer", { producerId: id });
    }
  );

  onAsync("transport_recv_connect", async ({ dtlsParameters }) => {
    await mediaSoupService.connectTransport(
      socket.data.consumerTransportId,
      dtlsParameters
    );
  });

  onAsync("consume", async ({ rtpCapabilities }, callback) => {
    const consumer = await mediaSoupService.createConsumer(
      socket.data.consumerTransportId,
      socket.data.producerId,
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
