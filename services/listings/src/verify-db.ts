import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const sellerId = 'sylvio-rand-id';

        const count = await prisma.listing.count();

        const stats = await prisma.sellerStats.findUnique({
            where: { userId: sellerId }
        });

        const latestListing = await prisma.listing.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { features: true, stats: true }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();