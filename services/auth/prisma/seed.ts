import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv"
import bcrypt from "bcrypt"

const EMAIL = process.env.EMAIL || "example@gmail.com"
const FIRSTNAME = process.env.FIRSTNAME || "CASA"
const LASTNAME = process.env.LASTNAME
const PASSWORD = process.env.PASSWORD || "CASA!1234"
const PHONE = process.env.PHONE

const MODERATOR_EMAIL = process.env.EMAIL || "moderator@gmail.com"
const MODERATOR_FIRSTNAME = process.env.FIRSTNAME || "srandria"
const MODERATOR_LASTNAME = process.env.LASTNAME
const MODERATOR_PASSWORD = process.env.PASSWORD || "CASA!1234"
const MODERATOR_PHONE = process.env.PHONE



const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(PASSWORD, salt);
  const passwordModeratorHash = await bcrypt.hash(MODERATOR_PASSWORD, salt);
  const adminCount = await prisma.user.count({
    where: { role: "ADMIN" }
  });
  const moderatorCount = await prisma.user.count({
    where: { role: "MODERATOR" }
  });


  if (adminCount < 1) {

    await prisma.user.upsert({
      where: { email: EMAIL },
      update: {
        role: "ADMIN"
      },
      create: {
        email: EMAIL,
        emailVerified: true,
        firstName: FIRSTNAME,
        lastName: LASTNAME,
        password: passwordHash,
        phone: PHONE,
        phoneVerified: true,
        role: "ADMIN"
      }
    });
  }


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
