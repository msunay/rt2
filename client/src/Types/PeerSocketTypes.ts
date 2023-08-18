import { types as mediasoupTypes } from 'mediasoup-client';

export interface PeersClientToServerEvents {
  create_room: (cb: any) => void;
  createWebRtcTransport: (senderObj: {sender: boolean}, callback: (params: any) => void) => void
  transport_connect: (producerTransportConnect: producerTransportConnect) => void;
  transport_produce: (transportProduce: transportProduce, callback: (id: { id: string }) => void) => void;
  transport_recv_connect: (producerTransportConnect: producerTransportConnect) => void;
  consume: (rtp: { rtpCapabilities: mediasoupTypes.RtpCapabilities }, callback: (params: any) => void) => void;
  consumer_resume: () => void;
  disconnect: () => void;
}

export interface PeersServerToClientEvents {
  connection_success: (Obj: connectionSuccess) => void;
  producer_closed: () => void;
}

interface producerTransportConnect {
  transportId?: string;
  dtlsParameters: mediasoupTypes.DtlsParameters;
}

interface transportProduce {
  transportId?: string;
  kind: string;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}
interface connectionSuccess {
  socketId: string;
  producerAlreadyExists: boolean;
}