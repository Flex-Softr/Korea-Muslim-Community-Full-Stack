import { redirect } from "next/navigation";

export default function EPSAppPage() {
  redirect("/eps?tab=app");
}
