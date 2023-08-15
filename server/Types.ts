import { Socket } from 'socket.io';
export interface ClientToServerEvents {
  connection_success: (socketId: socketId) => void;
}

export interface ServerToClientEvents {
  getRtpCapabilities: (cb: any) => void;
}

interface socketId {
  socketId: string;
}
