import jwt from 'jsonwebtoken';

export class ReservationClient { // TODO ajust after reservation-service done
  private static RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL || 'http://reservation-service:3001';
  private static INTERNAL_KEY_SECRET = process.env.INTERNAL_KEY_SECRET || "INTERNAL_KEY";


  static async getReservationStatus(listingId: string, userId: string) {
    const internalToken = jwt.sign(
      { service: 'reservation' },
      this.INTERNAL_KEY_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '30s'
      }
    );

    try {
      const response = await fetch(`${this.RESERVATION_SERVICE_URL}/reservation/internal/status?listingId=${listingId}&userId=${userId}`, {
        method: 'GET',
        headers: {
          'x-internal-key': internalToken
        }
      });

      if (response.status === 404) {
        return { confirmed: false };
      }

      if (!response.ok) {
        throw new Error('internal-server-error');
      }

      const data = await response.json();
      return data as { confirmed: boolean };

    } catch (error) {
      console.error("Failed to get reservation status:", error);
      return { confirmed: false };
    }
  }
}
