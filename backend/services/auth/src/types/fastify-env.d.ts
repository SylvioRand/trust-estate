import 'fastify'
import { EnvConfigInterface } from '../interfaces/config.interface'

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfigInterface
  }
}
