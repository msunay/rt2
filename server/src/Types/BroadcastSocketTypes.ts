// import { types as mediasoupTypes } from 'mediasoup';
// import type { MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup/node/lib/RtpParameters';
// import type { AppData, DtlsParameters, IceCandidate, IceParameters, SctpParameters } from 'mediasoup/node/lib/types';

import type { ConsumerOptions, TransportOptions } from "mediasoup-client/types";
import type { AppData, DtlsParameters, IceCandidate, IceParameters, MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/types";


export interface BroadcastEmitEvents {
  connection_success: (Obj: connectionSuccess) => void;
  producer_closed: () => void;
}

export interface BroadcastListenEvents {
  transport_produce: (
    transportProduce: transportProduce, callback: (id: { id: string }) => void) => void;
  getRtpCapabilities: (cb: any) => void;
  createWebRtcTransport: (producer: { producer: boolean }, callback: ({ transportOptions }: { transportOptions: TransportOptions }) => void) => void;
  transport_connect: (params: { dtlsParameters: DtlsParameters }, cb: any) => void;
  transport_recv_connect: (params: { dtlsParameters: DtlsParameters }) => void;
  consume: (rtpObj: { rtpCapabilities: RtpCapabilities }, initConsumer: ({ consumerOptions }: { consumerOptions: ConsumerOptions }) => void) => void;
  consumer_resume: () => void;
  create_room: (createDevice: ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities; }) => void) => void;
}

interface transportProduce {
  transportId?: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
}

interface connectionSuccess {
  socketId: string;
  producerAlreadyExists: boolean;
}

// export interface TransportOptions {
//   id: string;
//   iceParameters: IceParameters;
//   iceCandidates: IceCandidate[];
//   dtlsParameters: DtlsParameters;
//   sctpParameters?: SctpParameters | undefined;
//   iceServers?: RTCIceServer[] | undefined;
//   iceTransportPolicy?: RTCIceTransportPolicy | undefined;
//   additionalSettings?: any;
//   proprietaryConstraints?: any;
//   appData?: AppData | undefined;
// }

// interface ConsumerOptions {
//   id?: string | undefined;
//   producerId?: string | undefined;
//   kind?: "audio" | "video" | undefined;
//   rtpParameters: RtpParameters;
//   streamId?: string | undefined;
//   appData?: AppData | undefined;
// }