import { MediaSoupService } from "@/services/mediasoupService";
import type { BroadcastEmitEvents, BroadcastListenEvents } from "@/Types/BroadcastSocketTypes";
import type { Socket } from "socket.io";

// Create a singleton instance
const mediaSoupService = new MediaSoupService();

// Initialize the service on module load
(async () => {
  await mediaSoupService.initialize();
})();

export const peerSocketInit = (
    socket: Socket<BroadcastListenEvents, BroadcastEmitEvents>
  ) => {
    console.log(`New connection: ${socket.id}`);

    // Store peer-specific state
    const peerState = {
      producerTransportId: "",
      consumerTransportId: "",
      producerId: "",
      consumerId: "",
    };

    // Send initial connection success event
    socket.emit("connection_success", {
      socketId: socket.id,
      // Check if there are any active producers in the system
      producerAlreadyExists: false // This would be determined dynamically
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Peer disconnected: ${socket.id}`);
      mediaSoupService.cleanup(socket.id);
    });

    // Create or join a room
    socket.on("create_room", async (createDevice) => {
      try {
        const router = await mediaSoupService.getOrCreateRouter();
        createDevice({ rtpCapabilities: router.rtpCapabilities });
      } catch (error) {
        console.error("Error creating room:", error);
      }
    });

    // Get router RTP capabilities
    socket.on("getRtpCapabilities", async (callback) => {
      try {
        const router = await mediaSoupService.getOrCreateRouter();
        callback({ rtpCapabilities: router.rtpCapabilities });
      } catch (error) {
        console.error("Error getting RTP capabilities:", error);
        callback({ error: "Failed to get RTP capabilities" });
      }
    });

    // Create WebRTC transport
    socket.on("createWebRtcTransport", async ({ producer }, createProducerTransport) => {
      try {
        const { transport, transportOptions } = await mediaSoupService.createTransport(
          socket.id,
          producer
        );

        if (producer) {
          peerState.producerTransportId = transport.id;
        } else {
          peerState.consumerTransportId = transport.id;
        }

        createProducerTransport({ transportOptions });
      } catch (error) {
        console.error("Error creating WebRTC transport:", error);
      }
    });

    // Connect transport (producer)
    socket.on("transport_connect", async ({ dtlsParameters }) => {
      try {
        await mediaSoupService.connectTransport(
          peerState.producerTransportId,
          dtlsParameters
        );
      } catch (error) {
        console.error("Error connecting producer transport:", error);
      }
    });

    // Produce media
    socket.on(
      "transport_produce",
      async ({ kind, rtpParameters, appData }, callback) => {
        try {
          const producer = await mediaSoupService.createProducer(
            peerState.producerTransportId,
            kind,
            rtpParameters,
            appData
          );

          peerState.producerId = producer.id;

          callback({ id: producer.id });

          // Notify other clients about new producer
          // socket.broadcast.emit("new_producer", { producerId: producer.id });
        } catch (error) {
          console.error("Error producing:", error);
        }
      }
    );

    // Connect transport (consumer)
    socket.on("transport_recv_connect", async ({ dtlsParameters }) => {
      try {
        await mediaSoupService.connectTransport(
          peerState.consumerTransportId,
          dtlsParameters
        );
      } catch (error) {
        console.error("Error connecting consumer transport:", error);
      }
    });

    // Consume media
    socket.on("consume", async ({ rtpCapabilities }, callback) => {
      try {
        const consumer = await mediaSoupService.createConsumer(
          peerState.consumerTransportId,
          peerState.producerId, // This assumes the producer ID is already known
          rtpCapabilities
        );

        if (consumer) {
          peerState.consumerId = consumer.id;

          const consumerOptions = {
            id: consumer.id,
            producerId: consumer.producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          };

          callback({ consumerOptions });
        } else {
          throw "Cannot consume"
        }
      } catch (error) {
        console.error("Error consuming:", error);
      }
    });

    // Resume consumer
    // socket.on("consumer_resume", async () => {
    //   try {
    //     await mediaSoupService.resumeConsumer(peerState.consumerId);
    //   } catch (error) {
    //     console.error("Error resuming consumer:", error);
    //   }
    // });
  }