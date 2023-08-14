import { ClientToServerEvents, ServerToClientEvents } from "../Types";
import { Socket } from "socket.io";

const peersSocketInit = function (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
) {

};

export default peersSocketInit;
