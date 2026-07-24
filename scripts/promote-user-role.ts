/**
 * Promote a user to ADMIN or SUPER_ADMIN by email.
 *
 * Usage:
 *   npx tsx scripts/promote-user-role.ts admin@example.com SUPER_ADMIN
 *   npx tsx scripts/promote-user-role.ts someone@kmckr.org ADMIN
 */
import { PrismaClient } from "@prisma/client";
import { isUserRole, type UserRole } from "../src/lib/roles";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const rawRole = process.argv[3]?.trim() || "SUPER_ADMIN";

  if (!email) {
    console.error(
      "Usage: npx tsx scripts/promote-user-role.ts <email> [ADMIN|SUPER_ADMIN]",
    );
    process.exit(1);
  }

  if (!isUserRole(rawRole) || rawRole === "USER") {
    console.error("Role must be ADMIN or SUPER_ADMIN.");
    process.exit(1);
  }

  const role = rawRole as UserRole;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, name: true },
  });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role },
    select: { email: true, role: true, name: true },
  });

  console.info(
    `[promote] ${updated.email} (${updated.name ?? "no name"}): ${user.role} → ${updated.role}`,
  );
  console.info("Sign out and sign in again if the dashboard still looks limited.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
