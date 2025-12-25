import 'fastify'
import { EnvConfigInterface } from '../interfaces/config.interface.ts'

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfigInterface,
    authentication: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
  }
}
