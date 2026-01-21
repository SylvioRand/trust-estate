import { FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

export class AIClient {
  private static AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:3005';
  private static INTERNAL_KEY_SECRET = process.env.INTERNAL_KEY_SECRET || "INTERNAL_KEY";

  // TODO test after post /ai/index is done and put /ai/index is done
  static async upsertIndexListing(listing: any, method: "POST" | "PUT", listingFeatures: any) {
    const body = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      type: listing.type,
      propertyType: listing.propertyType,
      surface: listing.surface,
      zone: listing.zone,
      features: {
        bedrooms: listingFeatures.bedrooms,
        bathrooms: listingFeatures.bathrooms,
        wc: listingFeatures.wc,
        wcSeparate: listingFeatures.wc_separate,
        parkingType: listingFeatures.parking_type,
        gardenPrivate: listingFeatures.garden_private,
        pool: listingFeatures.pool,
        water_access: listingFeatures.water_access,
        electricityAccess: listingFeatures.electricity_access,
      },
      tags: listing.tags,
    };

    const internaltoken = jwt.sign(
      { service: 'listings' },
      this.INTERNAL_KEY_SECRET,
      { algorithm: "HS256" }
    );

    console.log("body value -> ", body);
    const result = await fetch(`${this.AI_SERVICE_URL}/ai/index`, {
      method: method,
      headers: {
        'x-internal-key': internaltoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!result.ok) {
      console.log("internal_server_error");
    };
  }

  static async deleteIndexLinsting(listingId: string,) {
    const internaltoken = jwt.sign(
      { service: "listings" }
      , this.AI_SERVICE_URL,
      { algorithm: "HS256" }
    );

    try {
      const result = await fetch(`${this.AI_SERVICE_URL}/ai/${listingId}`, {
        method: 'DELETE',
        headers: {
          'x-internal-key': internaltoken
        }
      })

      if (!result.ok) {
        console.log()
      }
    } catch (error) {
      console.log("internal_server_error");
    }
  }
}
