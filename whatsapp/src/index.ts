import http from "http";
import app from "./app";
import { PORT } from "./config/env";
import { initSockets } from "./sockets";
import logger from "./logger";

const server = http.createServer(app);
initSockets(server);

server.listen(PORT, () => {
  logger.info(`WhatsApp microservice listening on port ${PORT}`);
});
