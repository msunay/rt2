// import type {
//   BroadcastEmitEvents,
//   BroadcastListenEvents,
//   // ProducerOptions,
//   TransportOptions,
// } from "@/Types/BroadcastSocketTypes";
// import { Socket } from "socket.io";
// import * as mediasoup from "mediasoup";
// import type { RtpCodecCapability } from "mediasoup/node/lib/RtpParameters";
// import util from "util";
// import {
//   type AppData,
//   Consumer,
//   Producer,
//   type ProducerOptions,
//   Router,
//   Transport,
//   WebRtcServer,
//   type WebRtcServerOptions,
//   type WebRtcTransportOptions,
//   Worker,
// } from "mediasoup/node/lib/types";

// let msWorker: Worker;
// let msRouter: Router;
// let producerTransport: Transport | undefined;
// let consumerTransport: Transport | undefined;
// let producer: Producer;
// let consumer: Consumer;

// const createWorker = async () => {
//   const worker = await mediasoup.createWorker({
//     rtcMinPort: 40000,
//     rtcMaxPort: 40000,
//     logLevel: "debug",
//     logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp", "message"],
//   });
//   console.log(`worker pid: ${worker.pid}`);

//   worker.on("died", (err) => {
//     console.error("mediasoup worker has died", err);
//     setTimeout(() => process.exit(1), 2000);
//   });

//   const udpAnnouncedAddress =
//     process.env.NODE_ENV === "production"
//       ? process.env.UDP_ANNOUNCED_ADDRESS!
//       : "127.0.0.1";
//   const udpBindIp =
//     process.env.NODE_ENV === "production"
//       ? process.env.UDP_BIND_IP!
//       : "0.0.0.0";
//   const tcpAnnouncedAddress =
//     process.env.NODE_ENV === "production"
//       ? process.env.TCP_ANNOUNCED_ADDRESS!
//       : "127.0.0.1";
//   const tcpBindIp =
//     process.env.NODE_ENV === "production"
//       ? process.env.TCP_BIND_IP!
//       : "0.0.0.0";

//   const webRtcServerOptions = {
//     listenInfos: [
//       {
//         protocol: "udp",
//         ip: udpBindIp,
//         announcedAddress: udpAnnouncedAddress,
//       },
//       {
//         protocol: "tcp",
//         ip: tcpBindIp,
//         announcedAddress: tcpAnnouncedAddress,
//       },
//     ],
//   } as WebRtcServerOptions;

//   const webRtcServer = await worker
//     .createWebRtcServer(webRtcServerOptions)
//     .catch((err) => {
//       console.error("Error:", err);
//       process.exit(1);
//     });

//   worker.appData.webRtcServer = webRtcServer;

//   return worker;
// };

// createWorker().then((w) => (msWorker = w));

// const iceServers = [
//   {
//     urls: "turn:a.relay.metered.ca:80",
//     username: process.env.ICE_USERNAME,
//     credential: process.env.ICE_CREDENTIAL,
//   },
//   {
//     urls: "turn:a.relay.metered.ca:80?transport=tcp",
//     username: process.env.ICE_USERNAME,
//     credential: process.env.ICE_CREDENTIAL,
//   },
//   {
//     urls: "turn:a.relay.metered.ca:443",
//     username: process.env.ICE_USERNAME,
//     credential: process.env.ICE_CREDENTIAL,
//   },
//   {
//     urls: "turn:a.relay.metered.ca:443?transport=tcp",
//     username: process.env.ICE_USERNAME,
//     credential: process.env.ICE_CREDENTIAL,
//   },
// ];

// const mediaCodecs: RtpCodecCapability[] = [
//   {
//     kind: "audio",
//     mimeType: "audio/opus",
//     clockRate: 48000,
//     channels: 2,
//   },
//   {
//     kind: "video",
//     mimeType: "video/VP8",
//     clockRate: 90000,
//     parameters: {
//       "x-google-start-bitrate": 1000,
//     },
//   },
//   {
//     kind: "video",
//     mimeType: "video/VP9",
//     clockRate: 90000,
//     parameters: {
//       "profile-id": 2,
//       "x-google-start-bitrate": 1000,
//     },
//   },
//   {
//     kind: "video",
//     mimeType: "video/h264",
//     clockRate: 90000,
//     parameters: {
//       "packetization-mode": 1,
//       "profile-level-id": "4d0032",
//       "level-asymmetry-allowed": 1,
//       "x-google-start-bitrate": 1000,
//     },
//   },
//   {
//     kind: "video",
//     mimeType: "video/h264",
//     clockRate: 90000,
//     parameters: {
//       "packetization-mode": 1,
//       "profile-level-id": "42e01f",
//       "level-asymmetry-allowed": 1,
//       "x-google-start-bitrate": 1000,
//     },
//   },
// ];

// const createWebRtcTransport = async (
//   createProducerTransport: ({
//     transportOptions,
//   }: {
//     transportOptions: TransportOptions;
//   }) => void
// ) => {
//   try {
//     const webRtcTransportOptions: WebRtcTransportOptions = {
//       webRtcServer: msWorker.appData.webRtcServer as WebRtcServer<AppData>,
//       enableUdp: true,
//       enableTcp: true,
//       preferUdp: true,
//     };

//     const transport = await msRouter.createWebRtcTransport(
//       webRtcTransportOptions
//     );
//     console.log(`transport id: ${transport.id}`);

//     transport.on("dtlsstatechange", (dtlsState) => {
//       if (dtlsState === "closed") {
//         transport.close();
//       }
//     });

//     transport.on("@close", () => {
//       console.log("Transport closed");
//     });

//     console.log("Transport Params:!!!!!!!!!!!!!!!!!!!!!!");
//     console.log(
//       util.inspect(
//         {
//           transportParams: {
//             id: transport.id,
//             iceParameters: transport.iceParameters,
//             iceCandidates: transport.iceCandidates,
//             dtlsParameters: transport.dtlsParameters,
//           },
//         },
//         { showHidden: false, depth: null, colors: true }
//       )
//     );
//     createProducerTransport({
//       transportOptions: {
//         id: transport.id,
//         iceParameters: transport.iceParameters,
//         iceCandidates: transport.iceCandidates,
//         dtlsParameters: transport.dtlsParameters,
//       },
//     });
//     return transport;
//   } catch (error) {
//     console.error(error);
//   }
// };

// let i = 0,
//   clients = 1;
// const broadcastSocketInit = async (
//   socket: Socket<BroadcastListenEvents, BroadcastEmitEvents>
// ) => {
//   console.log(
//     `\n\nclients: -- ${clients++} --\n\nconnection-${i++}:\n\tpeers ID: `,
//     socket.id
//   );

//   socket.emit("connection_success", {
//     socketId: socket.id,
//     producerAlreadyExists: producer ? true : false,
//   });

//   socket.on("disconnect", () => {
//     clients--;
//     console.log("peer disconnected");
//     consumer?.close();
//     producer?.close();
//     consumerTransport?.close();
//     producerTransport?.close();
//   });

//   const getRtpCapabilities = (callback: any) => {
//     const rtpCapabilities = msRouter.rtpCapabilities;
//     callback({ rtpCapabilities });
//   };

//   socket.on("create_room", async (callback) => {
//     if (msRouter === undefined) {
//       msRouter = await msWorker.createRouter({ mediaCodecs });
//       console.log(`Router ID: ${msRouter.id}`);
//     }

//     getRtpCapabilities(callback);
//   });

//   socket.on("getRtpCapabilities", (callback) => {
//     const rtpCapabilities = msRouter.rtpCapabilities;
//     console.log("RTP Capabilities", rtpCapabilities);

//     callback({ rtpCapabilities });
//   });

//   // socket.on('join_room', async ({ roomId }, callback) => {
//   //   if (msRouter === undefined) {
//   //     msRouter = await msWorker.createRouter({ mediaCodecs });
//   //     console.log(`Router ID: ${msRouter.id}`);
//   //   }
//   //   socket.join(roomId);
//   //   console.log(`Peer ${socket.id} joined room ${roomId}`);
//   //   getRtpCapabilities(callback);
//   // });

//   // socket.on('get_room_info', (callback) => {
//   //   // This is a placeholder - implement room info logic here
//   //   callback({
//   //     participants: [],
//   //     producerIds: []
//   //   });
//   // });

//   // socket.on('set_display_name', ({ displayName }, callback) => {
//   //   // Store display name logic here
//   //   console.log(`Set display name for ${socket.id}: ${displayName}`);
//   //   callback({ success: true });
//   // });

//   socket.on("createWebRtcTransport", async ({ producer }, callback) => {
//     try {
//       console.log(`Is this a producer request? ${producer ? "Yes" : "No"}`);
//       if (producer) producerTransport = await createWebRtcTransport(callback);
//       else consumerTransport = await createWebRtcTransport(callback);
//     } catch (error) {
//       console.log(error);
//     }
//   });

//   socket.on("transport_connect", async ({ dtlsParameters }) => {
//     console.log("DTLS Params: ", dtlsParameters);
//     await producerTransport!.connect({ dtlsParameters });
//   });

//   socket.on(
//     "transport_produce",
//     async ({ kind, rtpParameters, appData }, sendServerTransportId) => {
//       console.log(producerTransport);
//       producer = await producerTransport!.produce({
//         kind,
//         rtpParameters,
//         appData,
//       } as ProducerOptions);

//       console.log("Producer iD: ", producer.id, producer.kind);

//       producer.on("transportclose", () => {
//         console.log("transport for producer closed");
//       });

//       sendServerTransportId({
//         id: producer.id,
//       });
//     }
//   );

//   socket.on("transport_recv_connect", async ({ dtlsParameters }) => {
//     console.log(`DTLS params: ${dtlsParameters}`);
//     await consumerTransport?.connect({ dtlsParameters });
//   });

//   socket.on("consume", async ({ rtpCapabilities }, initConsumer) => {
//     console.log("Consumer request received");
//     try {
//       if (
//         msRouter.canConsume({
//           producerId: producer.id,
//           rtpCapabilities,
//         })
//       ) {
//         consumer = await consumerTransport!.consume({
//           producerId: producer.id,
//           rtpCapabilities,
//           paused: true,
//         });
//         consumer.on("transportclose", () => {
//           console.log("Transport closed from consumer");
//         });

//         consumer.on("producerclose", () => {
//           console.log("Producer of consumer closed");
//           socket.emit("producer_closed");
//         });

//         const consumerOptions = {
//           id: consumer.id,
//           producerId: producer.id,
//           kind: consumer.kind,
//           rtpParameters: consumer.rtpParameters,
//         };
//         console.log("consumerOptions:", consumerOptions);

//         initConsumer({ consumerOptions });
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   socket.on("consumer_resume", async () => {
//     console.log("consumer resume");
//     await consumer.resume();
//   });
// };

// export default broadcastSocketInit;
