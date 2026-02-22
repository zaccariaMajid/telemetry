// src/shared/plugins/errorHandler.plugin.js
import fastifyPlugin from 'fastify-plugin';
import { AppError } from '../errors/app-error.js';

async function errorHandlerPlugin(fastify) {
  fastify.setErrorHandler((error, req, reply) => {
    // errori nostri
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    // errori di validazione Fastify
    if (error.validation) {
      return reply.status(400).send({ error: 'Dati non validi', details: error.validation });
    }

    // errori non gestiti
    fastify.log.error(error);
    reply.status(500).send({ error: 'Errore interno del server' });
  });
}

export default fastifyPlugin(errorHandlerPlugin);