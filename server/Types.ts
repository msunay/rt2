import { Socket } from "socket.io"
export interface ClientToServerEvents {
  connection_success: (socketId: socketId) => void

}

export interface ServerToClientEvents {
}


interface socketId {
  socketId: string;
}