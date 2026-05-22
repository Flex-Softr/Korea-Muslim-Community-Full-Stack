import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserDashboardHome } from "@/components/dashboard/user-dashboard-home";
import { listDashboardBlogsByCreator } from "@/lib/dashboard/store";
import { prisma } from "@/lib/prisma";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, member, blogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
    session.user.email
      ? prisma.communityMember.findFirst({
          where: { contactEmail: session.user.email.trim().toLowerCase() },
          select: { memberCode: true, locationCity: true },
        })
      : Promise.resolve(null),
    listDashboardBlogsByCreator(session.user.id),
  ]);

  return (
    <UserDashboardHome
      profile={{
        name: user?.name ?? session.user.name ?? "",
        email: user?.email ?? session.user.email ?? "",
        memberCode: member?.memberCode ?? null,
        city: member?.locationCity ?? null,
      }}
      blogs={blogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        category: blog.category,
        dateIso: blog.dateIso,
        status: blog.status,
      }))}
    />
  );
}
