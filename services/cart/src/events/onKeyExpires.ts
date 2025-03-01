import { Redis } from "ioredis";

import { REDIS_HOST, REDIS_PORT } from "../config";
import { clearCart } from "@/services/clearCart";

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const CHANNEL_KEY = "__keyevent@0__:expired";
redis.config("SET", "notify-keyspace-events", "Ex");

redis.subscribe(CHANNEL_KEY);

redis.on("message", async (ch, message) => {
  try {
    if (ch === CHANNEL_KEY) {
      console.log("Expired Key", message);
      const id = message.replace("sessions:", "");
      console.log(id);
      clearCart(id);
    }
  } catch (e) {
    console.log(e);
  }
});
