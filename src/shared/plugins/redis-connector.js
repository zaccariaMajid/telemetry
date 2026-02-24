import fastifyPlugin from "fastify-plugin";
import { createClient } from "redis";
import { AppError } from "../errors/app-error.js";

async function redisConnector(fastify) {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new AppError("Missing REDIS_URL in environment");
  }

  const client = createClient({ url: redisUrl });
  client.on("error", (err) => {
    fastify.log.error({ err }, "Redis client error");
  });

  await client.connect();
  fastify.decorate("redis", client);
  fastify.log.info({ redisUrl }, "Connected to Redis");

  fastify.addHook("onClose", async () => {
    if (client.isOpen) {
      await client.quit();
    }
  });
}

export default fastifyPlugin(redisConnector, {
  name: "redis-connector",
});
