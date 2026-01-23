import 'fastify'
import { EnvConfigInterface } from '../interfaces/config.interface'
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfigInterface
    prisma: PrismaClient
    refreshSecret: string
    privateKey: any
    authentication: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
    partialAuthentication: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
    emailVerifiedAuthentication: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
    phoneVerifiedAuthentication: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
    authValidations: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
    internalAuthOnly: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
  }
}