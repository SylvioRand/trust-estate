import { FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

export class AIClient {
  private static AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:3005';
  private static INTERNAL_KEY_SECRET = process.env.INTERNAL_KEY_SECRET || "INTERNAL_KEY";

  static async upsertIndexListing(listing: any, method: "POST" | "PUT", listingFeatures: any) {
    const body = {
      id: listing.id,
      title: listing.title,
      photos: listing.photos,
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

    const result = await fetch(`${this.AI_SERVICE_URL}/ai/index`, {
      method: method,
      headers: {
        'x-internal-key': internaltoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const resultBody = await result.json();

    if (!result.ok) {
      console.error("AI Service Error:", result.status, resultBody);
    };
  }

  static async deleteIndexListing(listingId: string) {
    const internaltoken = jwt.sign(
      { service: "listings" },
      this.INTERNAL_KEY_SECRET,
      { algorithm: "HS256" }
    );

    try {
      const result = await fetch(`${this.AI_SERVICE_URL}/ai/index/${listingId}`, {
        method: 'DELETE',
        headers: {
          'x-internal-key': internaltoken
        }
      })

      const resultBody = await result.json();
      console.log("Response from AI SERVICE:", resultBody);

      if (!result.ok) {
        console.log()
      }
    } catch (error) {
      console.log("internal_server_error");
    }
  }
}
