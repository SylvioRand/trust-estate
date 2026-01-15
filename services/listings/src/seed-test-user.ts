import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const testUserId = "sylvio-rand-id";

        console.log("Utilisateur de test cible :", testUserId);

        const stats = await prisma.sellerStats.upsert({
            where: { userId: testUserId },
            update: {},
            create: {
                userId: testUserId,
                totalListings: 0,
                activeListings: 0
            }
        });
        console.log("Statistiques vendeur initialisées.");

    } catch (e) {
        console.error("Erreur lors du seeding :", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
