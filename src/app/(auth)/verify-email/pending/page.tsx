import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PendingVerifyContent } from "./components/pending-verify-content";

export default async function VerifyEmailPendingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.isEmailVerified) {
    redirect("/dashboard");
  }
  return (
    <PendingVerifyContent email={session.user.email ?? ""} />
  );
}
