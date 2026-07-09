import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { parseUserRole } from "@/lib/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, member] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true, name: true, role: true },
    }),
    session.user.email
      ? prisma.communityMember.findFirst({
          where: { contactEmail: session.user.email.trim().toLowerCase() },
          select: { imageUrl: true },
        })
      : Promise.resolve(null),
  ]);

  if (!user) {
    redirect("/login");
  }
  if (!user.emailVerified) {
    redirect("/verify-email/pending");
  }

  const role = parseUserRole(user.role);

  return (
    <DashboardShell
      role={role}
      email={user.email}
      name={user.name ?? session.user.name}
      image={member?.imageUrl?.trim() || session.user.image}
    >
      {children}
    </DashboardShell>
  );
}
