import { Socket } from "socket.io-client"
import { types as mediasoupTypes } from 'mediasoup-client';

export interface ClientToServerEvents {
  getRtpCapabilities: (cb: any) => void;
  createWebRtcTransport: (senderObj: {sender: boolean}, callback: (params: any) => void) => void
  transport_connect: (producerTransportConnect: producerTransportConnect) => void;
  transport_produce: (transportProduce: transportProduce, callback: (id: { id: string }) => void) => void;
}

export interface ServerToClientEvents {
  connection_success: (socketId: socketId) => void;

}


interface socketId {
  socketId: string;
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