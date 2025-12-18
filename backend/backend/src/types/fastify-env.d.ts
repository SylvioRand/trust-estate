import 'fastify'
import { EnvConfigInterface } from '../interfaces/config.interface.ts'

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfigInterface,
  }
}
