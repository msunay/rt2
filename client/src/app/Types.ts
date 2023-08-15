import { Socket } from "socket.io-client"
import { types as mediasoupTypes } from 'mediasoup-client';

export interface ClientToServerEvents {
  getRtpCapabilities: (cb: any) => void;

}

export interface ServerToClientEvents {
  connection_success: (socketId: socketId) => void
  createWebRtcTransport: (sender: boolean, cb: any) => void
}


interface socketId {
  socketId: string;
}