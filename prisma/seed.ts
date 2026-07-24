import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { loadServerEnv } from "../src/config/load-server-env";
import { parseUserRole, type UserRole } from "../src/lib/roles";

const prisma = new PrismaClient();

async function main() {
  const env = loadServerEnv();
  const email = env.SEED_USER_EMAIL;
  const password = env.SEED_USER_PASSWORD;
  const name = env.SEED_USER_NAME;
  const role: UserRole = env.SEED_USER_ROLE
    ? parseUserRole(env.SEED_USER_ROLE)
    : "ADMIN";

  if (!email || !password) {
    console.info(
      "[seed] No user inserted. Set SEED_USER_EMAIL and SEED_USER_PASSWORD if you want to create one user.",
    );
    return;
  }

  const normalized = email.trim().toLowerCase();
  const hashed = await hash(password, 12);

  const update: Prisma.UserUpdateInput = {
    password: hashed,
    role,
  };
  if (name?.trim()) {
    update.name = name.trim();
  }

  const verifiedAt = new Date();

  await prisma.user.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      password: hashed,
      name: name?.trim() || "Seeded user",
      role,
      emailVerified: verifiedAt,
    },
    update: { ...update, emailVerified: verifiedAt },
  });

  console.info(`[seed] Upserted user: ${normalized} (${role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
