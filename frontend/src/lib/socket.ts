// socket client wrapper
import { io, Socket } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_SOCKET_URL || "";
let socket: Socket;

if (typeof window !== "undefined") {
  socket = io(url, { transports: ["websocket"], autoConnect: true });
}

export default socket;
