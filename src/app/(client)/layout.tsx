import GTMInit from "@/components/GTMInit";
import { ClientFooter } from "@/components/layout/client-footer";
import { ClientHeader } from "@/components/layout/client-header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full max-w-full flex-col overflow-x-hidden">
      <ClientHeader />
      <main className="flex-1 max-w-full overflow-x-hidden">{children}</main>
      <ClientFooter />
      <GTMInit />
    </div>
  );
}
