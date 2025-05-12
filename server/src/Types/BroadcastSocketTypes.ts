import type { ConsumerOptions, TransportOptions } from "mediasoup-client/types";
import type { AppData, DtlsParameters, MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/types";


/**
 * Events *server* will send to the client.
 */
export interface BroadcastEmitEvents {
  connection_success: (payload: ConnectionSuccess) => void;
  producer_closed: () => void;
  new_producer: (payload: { producerId: string }) => void;
}

/**
 * Events *client* will send to the server.
 */
export interface BroadcastListenEvents {
  create_room: (
    callback: (response: { rtpCapabilities: RtpCapabilities }) => void
  ) => void;

  getRtpCapabilities: (
    callback: (response: { rtpCapabilities: RtpCapabilities } | { error: string }) => void
  ) => void;

  createWebRtcTransport: (
    opts: { producer: boolean },
    callback: (response: { transportOptions: TransportOptions }) => void
  ) => void;

  transport_connect: (opts: { transportId: string; dtlsParameters: DtlsParameters }) => void;

  transport_recv_connect: (opts: { transportId: string; dtlsParameters: DtlsParameters }) => void;

  transport_produce: (
    payload: TransportProducePayload,
    callback: (response: { id: string }) => void
  ) => void;

  consume: (
    opts: { rtpCapabilities: RtpCapabilities },
    callback: (response: { consumerOptions: ConsumerOptions } | { error: string }) => void
  ) => void;

  consumer_resume: (opts: { consumerId: string }) => void;
}

export interface TransportProducePayload {
  transportId?: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
}

export interface ConnectionSuccess {
  socketId: string;
  producerAlreadyExists: boolean;
}