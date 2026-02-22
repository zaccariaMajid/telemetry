// ESM
import fastifyPlugin from "fastify-plugin";
import fastifyMongo from "@fastify/mongodb";
import "dotenv/config";
import { AppError } from "../errors/app-error.js";

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */
async function dbConnector(fastify, options) {
  const mongoUrl = process.env.MONGO_URL || process.env.DATABASE_URL;

  if (!mongoUrl) {
    throw new AppError("Missing MONGO_URL or DATABASE_URL in environment");
  }

  // Avoid logging credentials while still showing target details for debugging.
  const sanitized = mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
  fastify.log.info({ mongoUrl: sanitized }, "Connecting to MongoDB");
  fastify.register(fastifyMongo, {
    url: mongoUrl,
  });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(dbConnector);
