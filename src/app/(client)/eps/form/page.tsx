import { redirect } from "next/navigation";

export default function EPSFormPage() {
  redirect("/eps?tab=form");
}
