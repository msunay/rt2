import { Socket } from 'socket.io';
import { types as mediasoupTypes } from 'mediasoup';
import { MediaKind } from 'mediasoup/node/lib/RtpParameters';


export interface ClientToServerEvents {
  connection_success: (socketId: socketId) => void;
}

export interface ServerToClientEvents {
  transport_produce: (transportProduce: transportProduce, callback: (id: { id: string }) => void) => void;
  getRtpCapabilities: (cb: any) => void;
  createWebRtcTransport: (sender: {sender: boolean}, cb: any) => void
  transport_connect: (params: { dtlsParameters: mediasoupTypes.DtlsParameters }, cb: any) => void;
  transport_recv_connect: (params: { dtlsParameters: mediasoupTypes.DtlsParameters }) => void;
  consume: (rtpObj: {rtpCapabilities: mediasoupTypes.RtpCapabilities}, cb: any) => void;
  consumer_resume: () => void;
}

interface socketId {
  socketId: string;
}

interface producerTransportConnect {
  transportId: string;
  dtlsParameters: mediasoupTypes.DtlsParameters;
}

interface transportProduce {
  transportId?: string;
  kind: MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}