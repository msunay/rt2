import type {
  AppData,
  ConsumerOptions,
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  TransportOptions,
} from 'mediasoup-client/lib/types';

export interface PeersClientToServerEvents {
  create_room: (callback: ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities}) => void) => void;

  createWebRtcTransport: (
    { sender }: { sender: boolean },
    callback: ({ transportOptions }: { transportOptions: TransportOptions }) => void,
  ) => void;

  transport_connect: ({ dtlsParameters }: { dtlsParameters: DtlsParameters}) => void;

  transport_produce: (
    transportProduce: ProducerOptions,
    callback: (id: { id: string }) => void,
  ) => void;

  transport_recv_connect: ({ dtlsParameters }: { dtlsParameters: DtlsParameters}) => void;

  consume: (
    rtp: { rtpCapabilities: RtpCapabilities },
    callback: ({ consumerOptions }: { consumerOptions: ConsumerOptions }) => void,
  ) => void;

  consumer_resume: () => void;

  disconnect: () => void;
}

export interface PeersServerToClientEvents {
  connection_success: (Obj: ConnectionSuccess) => void;
  producer_closed: () => void;
}

interface ProducerOptions {
  id?: string | undefined;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  paused?: boolean | undefined;
  keyFrameRequestDelay?: number | undefined;
  appData?: AppData | undefined;
}

interface ConnectionSuccess {
  socketId: string;
  producerAlreadyExists: boolean;
}
