import { FastifyRequest, FastifyReply } from "fastify";
import { ReportListingSchema } from "../listing.schema";
import { ListingService } from "../listing.service";
import { ZodError } from "zod";

export async function handleReport(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const validatedData = ReportListingSchema.parse(request.body);

    await ListingService.reportListing(id, user.id, validatedData);

    return reply.status(200).send({
      success: true,
      message: "listing.report_success"
    });

  } catch (error: any) {
    if (error instanceof ZodError) {
      const details: Record<string, string[]> = {};
      error.issues.forEach(issue => {
        const path = issue.path[0] as string;
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(issue.message);
      });

      return reply.status(400).send({
        error: "validation_failed",
        message: "common.validation_failed",
        details
      });
    }

    if (error.message === 'listing.not_found') {
      return reply.status(404).send({
        error: "listing_not_found",
        message: "listing.not_found"
      });
    }

    if (error.message === 'listing.cannot_report_own') {
      return reply.status(400).send({
        error: "bad_request",
        message: "listing.cannot_report_own"
      });
    }

    if (error.message === 'listing.already_reported') {
      return reply.status(409).send({
        error: "conflict",
        message: "listing.already_reported"
      });
    }

    console.error(error);
    return reply.status(500).send({ error: "internal_server_error" });
  }
}
