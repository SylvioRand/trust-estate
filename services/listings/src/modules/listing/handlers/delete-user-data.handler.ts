import { FastifyRequest, FastifyReply } from 'fastify';
import { ListingService } from '../listing.service';
import { GetDeleteUserDataParams } from '../listing.schema';

export async function handleDeleteUserData(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.headers['x-user-id'] as string;
  try {
    await ListingService.deleteUserData(userId);

    return reply.status(200).send({
      deleted: true,
      message: 'User data deleted successfully'
    });
  } catch (error: any) {
    request.log.error({
      userId,
      error: error.message,
      action: 'delete_user_data_failed'
    });

    return reply.status(500).send({
      error: 'internal_server_error',
      message: 'common.internal_server_error'
    });
  }
}
