import { FastifyInstance } from "fastify";
import { handlePublish } from "./handlers/publish.handler";
import { handleGetMine } from "./handlers/get-mine.handler";
import { handleSearch } from "./handlers/search.handler";
import { handleUpdate } from "./handlers/update.handler";
import { handleArchive } from "./handlers/archive.handler";
import { handleReport } from "./handlers/report.handler";
import { handleGetOne } from "./handlers/get-one.handler";
import { handleGetSellerStats } from "./handlers/get-seller-stats.handler";
import { handleDeleteUserData } from "./handlers/delete-user-data.handler";
import { handleUpdateAvailability } from "./handlers/update-availability.handler";
import { handleMarkAsRealized } from "./handlers/mark-unvailable.handler";
import { handleMakeAvailable } from "./handlers/make-available.handler";
import { getAvailability } from "./handlers/get-availability.handler";
import { handleConfirmReservation } from "./handlers/increment-reservation-stat.handler";

export async function listingRoutes(app: FastifyInstance) {
  app.get("/health", async (req, reply) => reply.status(200).send({ status: "ok" }));
  app.get('/mine', { preHandler: (app as any).authenticate }, handleGetMine);
  app.get('/', { preHandler: (app as any).optionalAuthenticate }, handleSearch);
  app.get('/seller/:userId/stats', { preHandler: (app as any).internalAuthenticate }, handleGetSellerStats);
  app.get('/:id', { preHandler: (app as any).optionalAuthenticate }, handleGetOne);
  app.get('/:id/availability', { preHandler: (app as any).optionalAuthenticate }, getAvailability);
  app.put('/:id', { preHandler: (app as any).authenticate }, handleUpdate);
  app.put('/:id/mark-realized', { preHandler: (app as any).authenticate }, handleMarkAsRealized);
  app.put('/:id/make-available', { preHandler: (app as any).authenticate }, handleMakeAvailable);
  app.post('/publish', { preHandler: (app as any).authenticate }, handlePublish);
  app.post('/:id/archive', { preHandler: (app as any).authenticate }, handleArchive);
  app.post('/:id/report', { preHandler: (app as any).authenticate }, handleReport);
  app.post('/:id/availability', { preHandler: (app as any).authenticate }, handleUpdateAvailability);
  app.delete('/internal/user/data', { preHandler: (app as any).internalAuthenticate }, handleDeleteUserData);
  app.post('/listings/:listingId/events/reservation-confirmed', { preHandler: (app as any).internalAuthenticate }, handleConfirmReservation);
}
