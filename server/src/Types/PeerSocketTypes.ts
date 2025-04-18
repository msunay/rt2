import { types as mediasoupTypes } from 'mediasoup';
import { MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup/node/lib/RtpParameters';
import { AppData, DtlsParameters, IceCandidate, IceParameters, SctpParameters } from 'mediasoup/node/lib/types';


export interface PeersClientToServerEvents {
  connection_success: (Obj: connectionSuccess) => void;
  producer_closed: () => void;
}

export interface PeersServerToClientEvents {
  transport_produce: (
    transportProduce: transportProduce, callback: (id: { id: string }) => void) => void;
  getRtpCapabilities: (cb: any) => void;
  createWebRtcTransport: (sender: { sender: boolean }, callback: ({ transportOptions }: { transportOptions: TransportOptions }) => void) => void;
  transport_connect: (params: { dtlsParameters: DtlsParameters }, cb: any) => void;
  transport_recv_connect: (params: { dtlsParameters: DtlsParameters }) => void;
  consume: (rtpObj: { rtpCapabilities: RtpCapabilities }, initConsumer: ({ consumerOptions }: { consumerOptions: ConsumerOptions }) => void) => void;
  consumer_resume: () => void;
  create_room: (cb: any) => void;
}

interface transportProduce {
  transportId?: string;
  kind: MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}

interface connectionSuccess {
  socketId: string;
  producerAlreadyExists: boolean;
}

export interface TransportOptions {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
  sctpParameters?: SctpParameters | undefined;
  iceServers?: RTCIceServer[] | undefined;
  iceTransportPolicy?: RTCIceTransportPolicy | undefined;
  additionalSettings?: any;
  proprietaryConstraints?: any;
  appData?: AppData | undefined;
}

interface ConsumerOptions {
  id?: string | undefined;
  producerId?: string | undefined;
  kind?: "audio" | "video" | undefined;
  rtpParameters: RtpParameters;
  streamId?: string | undefined;
  appData?: AppData | undefined;
}