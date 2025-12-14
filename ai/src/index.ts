// src/index.ts
import http from "http";
import app from "./app";
import { PORT } from "./config/env";
import logger from "./logger";

// Roman Urdu: yeh AI microservice ka main entry point hai.
// Server create ho kar express app ko bind karta hai.

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`AI microservice listening on port ${PORT}`);
});
