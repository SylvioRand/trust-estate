import { FastifyRequest, FastifyReply } from "fastify"
import { FlaggedListingsQuerySchema } from "../admin.schema";
import { AdminServices } from "../admin.service";

export async function handleGetFlagged(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Valider et parser les query params
        const query = FlaggedListingsQuerySchema.parse(request.query);

        // Récupérer les annonces signalées depuis la base de données
        const result = await AdminServices.getFlagged(query);

        return reply.status(200).send(result);
    }
    catch (error) {
        console.error("Error in handleGetFlagged:", error);

        // Erreur de validation Zod
        if (error instanceof Error && error.name === 'ZodError') {
            return reply.status(400).send({
                error: "validation_error",
                message: "Invalid query parameters"
            });
        }

        // Erreur serveur
        return reply.status(500).send({
            error: "internal_error",
            message: "An error occurred while fetching flagged listings"
        });
    }
}