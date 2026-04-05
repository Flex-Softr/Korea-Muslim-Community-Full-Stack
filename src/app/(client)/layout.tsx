import { ClientFooter } from "@/components/layout/client-footer";
import { ClientHeader } from "@/components/layout/client-header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <ClientHeader />
      <main className="flex-1">{children}</main>
      <ClientFooter />
    </div>
  );
}
