import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt"


const MODERATOR_EMAIL = process.env.EMAIL || "moderator@gmail.com"
const MODERATOR_FIRSTNAME = process.env.FIRSTNAME || "srandria"
const MODERATOR_LASTNAME = process.env.LASTNAME
const MODERATOR_PASSWORD = process.env.PASSWORD || "CASA!1234"
const MODERATOR_PHONE = process.env.PHONE


const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(12);
  const passwordModeratorHash = await bcrypt.hash(MODERATOR_PASSWORD, salt);

  const moderatorCount = await prisma.user.count({
    where: { role: "MODERATOR" }
  });


  if (moderatorCount < 1) {

    await prisma.user.upsert({
      where: { email: MODERATOR_EMAIL },
      update: {
        role: "MODERATOR"
      },
      create: {
        email: MODERATOR_EMAIL,
        emailVerified: true,
        firstName: MODERATOR_FIRSTNAME,
        lastName: MODERATOR_LASTNAME,
        password: passwordModeratorHash,
        phone: MODERATOR_PHONE,
        phoneVerified: true,
        role: "MODERATOR"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
