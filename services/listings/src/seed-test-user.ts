import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Override with a real user ID from auth DB if needed
const SELLER_ID = process.env.SELLER_ID || '00000000-0000-0000-0000-000000000001';

const listings = [
  {
    type: 'sale' as const,
    propertyType: 'apartment' as const,
    title: 'Appartement 3 pièces - Centre-ville',
    description: 'Bel appartement lumineux de 75m² en plein cœur de la ville. Cuisine équipée, double vitrage, ascenseur.',
    price: 185000,
    surface: 75,
    zone: 'Antananarivo',
    photos: [],
    tags: [],
    features: {
      bedrooms: 2,
      bathrooms: 1,
      wc: true,
      wc_separate: true,
      parking_type: 'parking' as const,
    },
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '15:00' },
    ],
  },
  {
    type: 'rent' as const,
    propertyType: 'house' as const,
    title: 'Villa avec jardin - Quartier résidentiel',
    description: 'Grande maison familiale de 140m² avec jardin privatif et piscine. Idéale pour famille. Parking 2 voitures.',
    price: 1200,
    surface: 140,
    zone: 'Antananarivo',
    photos: [],
    tags: ['exclusive' as const],
    features: {
      bedrooms: 4,
      bathrooms: 2,
      wc: true,
      wc_separate: true,
      garden_private: true,
      pool: true,
      parking_type: 'garage' as const,
    },
    availability: [
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ],
  },
  {
    type: 'sale' as const,
    propertyType: 'land' as const,
    title: 'Terrain constructible 500m² - Zone résidentielle',
    description: 'Terrain plat entièrement viabilisé (eau, électricité). Certificat de situation urbanistique disponible.',
    price: 65000,
    surface: 500,
    zone: 'Mahajanga',
    photos: [],
    tags: ['urgent' as const],
    features: {
      water_access: true,
      electricity_access: true,
    },
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
    ],
  },
  {
    type: 'rent' as const,
    propertyType: 'apartment' as const,
    title: 'Studio meublé - Proche universités',
    description: 'Studio entièrement meublé de 28m². Parfait pour étudiant. Charge internet incluse.',
    price: 350,
    surface: 28,
    zone: 'Toamasina',
    photos: [],
    tags: [],
    features: {
      bedrooms: 0,
      bathrooms: 1,
      wc: true,
      wc_separate: false,
      parking_type: 'none' as const,
    },
    availability: [
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
    ],
  },
  {
    type: 'sale' as const,
    propertyType: 'commercial' as const,
    title: 'Local commercial 80m² - Artère principale',
    description: 'Local en rez-de-chaussée sur artère très passante. Vitrine de 6m, WC, réserve. Idéal boutique ou restaurant.',
    price: 120000,
    surface: 80,
    zone: 'Fianarantsoa',
    photos: [],
    tags: ['exclusive' as const, 'urgent' as const],
    features: {
      wc: true,
      wc_separate: false,
      parking_type: 'none' as const,
    },
    availability: [
      { dayOfWeek: 1, startTime: '08:30', endTime: '17:30' },
      { dayOfWeek: 2, startTime: '08:30', endTime: '17:30' },
      { dayOfWeek: 4, startTime: '08:30', endTime: '17:30' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding listings...');

  for (const listing of listings) {
    const { features, availability, ...listingData } = listing;

    const created = await prisma.listing.create({
      data: {
        ...listingData,
        sellerId: SELLER_ID,
        features: {
          create: features,
        },
        stats: {
          create: {},
        },
        availability: {
          create: availability,
        },
      },
    });

    console.log(`  ✅ Created: ${created.title} (${created.id})`);
  }

  // Upsert seller stats
  await prisma.sellerStats.upsert({
    where: { userId: SELLER_ID },
    update: {
      totalListings: { increment: listings.length },
      activeListings: { increment: listings.length },
    },
    create: {
      userId: SELLER_ID,
      totalListings: listings.length,
      activeListings: listings.length,
    },
  });

  console.log(`\n✅ ${listings.length} listings seeded for seller ${SELLER_ID}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
