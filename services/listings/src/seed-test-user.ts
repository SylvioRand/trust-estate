import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const testUser = await prisma.user.upsert({
            where: { email: "srandria@trust-estate.mg" },
            update: {
                firstName: "Sylvio",
                lastName: "Rand"
            },
            create: {
                id: "sylvio-rand-id",
                email: "srandria@trust-estate.mg",
                firstName: "Sylvio",
                lastName: "Rand",
                phone: "0340000000",
                role: "USER",
            },
        });

        console.log("Utilisateur de test prêt :", testUser.id);

        const stats = await prisma.sellerStats.upsert({
            where: { userId: testUser.id },
            update: {},
            create: {
                userId: testUser.id,
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
