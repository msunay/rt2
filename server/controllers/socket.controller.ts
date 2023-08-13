import { ClientToServerEvents, ServerToClientEvents } from "../Types";
import { Socket } from "socket.io";
import { io } from "../index";

const socketInit = function (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
) {

};

export default socketInit;
