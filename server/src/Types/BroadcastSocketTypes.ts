import type { ConsumerOptions, TransportOptions } from "mediasoup-client/types";
import type { AppData, DtlsParameters, IceCandidate, IceParameters, MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/types";


/**
 * Events *server* will send to the client.
 */
export interface BroadcastEmitEvents {
  /** Emitted as soon as the socket connects successfully. */
  connection_success: (payload: ConnectionSuccess) => void;

  /** Emitted when a producer closes / stops on this socket. */
  producer_closed: () => void;

  /** Emitted to *all other* peers when someone produces. */
  new_producer: (payload: { producerId: string }) => void;
}

/**
 * Events *client* will send to the server.
 */
export interface BroadcastListenEvents {
  /** Join or create a room; callback gets the router’s RTP capabilities */
  create_room: (
    callback: (response: { rtpCapabilities: RtpCapabilities }) => void
  ) => void;

  /** Ask for the router’s RTP capabilities */
  getRtpCapabilities: (
    callback: (response: { rtpCapabilities: RtpCapabilities } | { error: string }) => void
  ) => void;

  /** Create a WebRTC transport (producer or consumer side) */
  createWebRtcTransport: (
    opts: { producer: boolean },
    callback: (response: { transportOptions: TransportOptions }) => void
  ) => void;

  /** Connect DTLS params for a producer transport */
  transport_connect: (opts: { dtlsParameters: DtlsParameters }) => void;

  /** Connect DTLS params for a consumer transport */
  transport_recv_connect: (opts: { dtlsParameters: DtlsParameters }) => void;

  /** Tell the server to produce media on your producer transport */
  transport_produce: (
    payload: TransportProducePayload,
    callback: (response: { id: string }) => void
  ) => void;

  /** Tell the server you’re ready to consume; callback gets your consumer options */
  consume: (
    opts: { rtpCapabilities: RtpCapabilities },
    callback: (response: { consumerOptions: ConsumerOptions } | { error: string }) => void
  ) => void;

  /** Resume a paused consumer */
  consumer_resume: (opts: { consumerId: string }) => void;
}

/** Shape of the “produce” payload from client → server */
export interface TransportProducePayload {
  transportId?: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
}

/** Shape of the object passed to the client on successful connection */
export interface ConnectionSuccess {
  socketId: string;
  producerAlreadyExists: boolean;
}