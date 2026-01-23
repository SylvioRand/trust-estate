import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv"
import bcrypt from "bcrypt"

const EMAIL = process.env.EMAIL || "example@gmail.com"
const FIRSTNAME = process.env.FIRSTNAME || "CASA"
const LASTNAME = process.env.LASTNAME
const PASSWORD = process.env.PASSWORD || "CASA!1234"
const PHONE = process.env.PHONE

const prisma = new PrismaClient();

async function main() {
	const salt = await bcrypt.genSalt(12);
	const passwordHash = await bcrypt.hash(PASSWORD, salt);
	const adminCount = await prisma.user.count({
		where: { role: "ADMIN" }
	});

	if (adminCount > 1)
		return;
	 await prisma.user.upsert({
		where: {email: EMAIL},
		update : {
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

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
