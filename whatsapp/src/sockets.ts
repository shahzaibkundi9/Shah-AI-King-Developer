// socket.io server wrapper
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "./logger";

let io: Server;

export function initSockets(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e6
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    socket.on("join", (room: string) => {
      logger.info(`Socket ${socket.id} join ${room}`);
      socket.join(room);
    });
    socket.on("disconnect", () => logger.info(`Socket disconnected: ${socket.id}`));
  });
}

export function emit(event: string, payload: any, room?: string) {
  if (!io) return;
  if (room) io.to(room).emit(event, payload);
  else io.emit(event, payload);
}
