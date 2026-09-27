import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://nightclub:nightclub@localhost:5432/nightclub?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const startsAt = new Date("2030-01-01T20:00:00.000Z");
  const endsAt = new Date("2030-01-02T06:00:00.000Z");

  await prisma.availabilityBlock.upsert({
    where: {
      startsAt_endsAt_reason: {
        startsAt,
        endsAt,
        reason: "Development: private event",
      },
    },
    update: {},
    create: {
      startsAt,
      endsAt,
      reason: "Development: private event",
      notes: "Seeded availability block for local scheduling tests.",
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail || adminPassword) {
    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must both be configured to seed a manager.",
      );
    }
    if (adminPassword.length < 12) {
      throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
    }

    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: {
        name: process.env.ADMIN_NAME?.trim() || "ZONA Manager",
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "MANAGER",
      },
      create: {
        name: process.env.ADMIN_NAME?.trim() || "ZONA Manager",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "MANAGER",
      },
    });
    console.log(`Manager account seeded for ${adminEmail}.`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
