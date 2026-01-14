import jwt from "jsonwebtoken";

export class AuthClient {
    private static AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    private static INTERNAL_KEY_SECRET = process.env.INTERNAL_KEY_SECRET || "INTERNAL_KEY";

    static async verifyToken(rawCookie: string | undefined) {
        if (!this.INTERNAL_KEY_SECRET) {
            throw new Error('INTERNAL_KEY_SECRET is not defined');
        }

        const internalToken = jwt.sign(
            { service: 'listings' },
            this.INTERNAL_KEY_SECRET,
            { algorithm: 'HS256' }
        );

        try {
            const response = await fetch(`${this.AUTH_SERVICE_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'x-internal-key': internalToken,
                    'Cookie': rawCookie || '',
                },
            });

            if (!response.ok) {
                throw new Error('auth.unauthorized');
            }

            return await response.json() as { id: string; role: string; emailVerified: boolean; phoneVerified: boolean };
        } catch (error) {
            console.error('❌ Auth verification failed:', error);
            throw new Error('auth.verification_failed');
        }
    }
}