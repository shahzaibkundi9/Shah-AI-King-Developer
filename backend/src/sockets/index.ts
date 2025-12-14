import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "../logger";

export default function initSockets(server: HttpServer) {
  const io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", (socket: Socket) => {
    logger.info(`socket connected ${socket.id}`);
    socket.on("join_user", (userId: string) => socket.join(`user_${userId}`));
    socket.on("disconnect", () => logger.info(`socket disconnected ${socket.id}`));
  });
  (global as any).io = io;
}
