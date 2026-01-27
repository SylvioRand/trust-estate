
import jwt from "jsonwebtoken";

export class creditClient {
  private static CREDITS_SERVICE_URL = process.env.CREDITS_SERVICE_URL || 'http://credits-service:3004';
  private static INTERNAL_KEY_SECRET = process.env.INTERNAL_KEY_SECRET || "INTERNAL_KEY";

  static async debit(userID: string) {
    if (!this.INTERNAL_KEY_SECRET) {
      throw new Error('INTERNAL_KEY_SECRET is not defined');
    }

    const internalToken = jwt.sign(
      { service: 'listings', userId: userID },
      this.INTERNAL_KEY_SECRET,
      { algorithm: 'HS256' }
    );

    try {
      const jsonBody = JSON.stringify({
        reason: "publish_listing",
      });
      const url = `${this.CREDITS_SERVICE_URL}/internal/credits/debit`;
      const response = await fetch(url, {
        method: 'POST',
        body: jsonBody,
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': internalToken,
          'x-user-id': userID
        }
      });

      if (response.status === 402) {
        throw new Error('credit.insufficient_credits');
      }

      if (!response.ok) {
        throw new Error('credit.unauthorized');
      }
      return await response.json() as { success: boolean; newBalance: number; transactionId: string };
    } catch (error: any) {
      console.error('❌ Credit verification failed:', error);
      throw new Error(error.message || 'credit.verification_failed');
    }
  }
}
