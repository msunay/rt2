import type {
  AppData,
  ConsumerOptions,
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  TransportOptions,
} from "mediasoup-client/lib/types";
import { CommonSocketClientToServerEvents, CommonSocketServerToClientEvents } from "./CommonSocketTypes";

/**
 * Interface for producer options
 */
export interface ProducerOptions {
  id?: string | undefined;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  paused?: boolean | undefined;
  keyFrameRequestDelay?: number | undefined;
  appData?: AppData | undefined;
}

/**
 * Interface for connection success response
 */
export interface ConnectionSuccess {
  socketId: string;
  producerAlreadyExists: boolean;
}

export interface PeersClientToServerEvents extends CommonSocketClientToServerEvents {
  // Create a new room and get RTP capabilities
  create_room: (
    callback: ({
      rtpCapabilities,
    }: {
      rtpCapabilities: RtpCapabilities;
    }) => void
  ) => void;

  // Request creation of a WebRTC transport
  createWebRtcTransport: (
    { sender }: { sender: boolean },
    callback: ({
      transportOptions,
    }: {
      transportOptions: TransportOptions;
    }) => void
  ) => void;

  // Connect a transport with DTLS parameters
  transport_connect: ({
    dtlsParameters,
  }: {
    dtlsParameters: DtlsParameters;
  }) => void;

  // Produce media through a transport
  transport_produce: (
    transportProduce: ProducerOptions,
    callback: (id: { id: string }) => void
  ) => void;

  // Connect a receiving transport with DTLS parameters
  transport_recv_connect: ({
    dtlsParameters,
  }: {
    dtlsParameters: DtlsParameters;
  }) => void;

  // Consume media with provided RTP capabilities
  consume: (
    rtp: { rtpCapabilities: RtpCapabilities },
    callback: ({
      consumerOptions,
    }: {
      consumerOptions: ConsumerOptions;
    }) => void
  ) => void;

  // Resume a consumer
  consumer_resume: () => void;

  // Disconnect from the room
  disconnect: () => void;
}

export interface PeersServerToClientEvents extends CommonSocketServerToClientEvents{
  // Connection established successfully
  connection_success: (data: ConnectionSuccess) => void;

  // Producer has been closed
  producer_closed: () => void;
}
