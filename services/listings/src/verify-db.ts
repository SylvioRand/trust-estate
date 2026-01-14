import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const sellerId = 'sylvio-rand-id';

        const count = await prisma.listing.count();
        console.log(`Nombre d'annonces totales : ${count}`);

        const stats = await prisma.sellerStats.findUnique({
            where: { userId: sellerId }
        });
        console.log(`Stats du vendeur ${sellerId} :`, stats);

        const latestListing = await prisma.listing.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { features: true, stats: true }
        });
        console.log(`Dernière annonce :`, JSON.stringify(latestListing, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();