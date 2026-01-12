import 'fastify'
import { EnvConfigInterface } from '../interfaces/config.interface'
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfigInterface
	prisma: PrismaClient
	authentication: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
  }
}
