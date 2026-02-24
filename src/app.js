import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import dbConnector from './shared/plugins/db-connector.js'
import redisConnector from './shared/plugins/redis-connector.js'
import jwtPlugin from './shared/plugins/jwt.js'
import errorHandlerPlugin from './shared/plugins/error-handler.plugin.js'
import auditPlugin from './shared/plugins/audit-plugin.js'
import moduleOrchestrator from './modules/module-orchestrator.js'

const app = Fastify({
  logger: false
});

app.register(dbConnector);
app.register(redisConnector);
app.register(fastifyCookie, {
  hook: 'onRequest'
});
app.register(jwtPlugin);
app.register(auditPlugin);
app.register(errorHandlerPlugin);
app.register(moduleOrchestrator);

export default app
