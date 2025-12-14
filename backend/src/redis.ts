// redis client (ioredis)
import Redis from "ioredis";
import { REDIS_URL } from "./config/env";

const redis = new Redis(REDIS_URL);

redis.on("error", (e) => {
  console.error("Redis error:", e.message);
});

export default redis;
