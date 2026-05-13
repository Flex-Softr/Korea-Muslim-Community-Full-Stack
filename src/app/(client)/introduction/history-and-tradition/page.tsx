import { PageBanner } from "@/components/layout/page-banner";
import { PageContent } from "../../components/page-content";
import { PageSidebar } from "../../components/page-sidebar";
import { getServerT } from "@/lib/i18n/server-translate";

export default async function HistoryAndTraditionPage() {
  const st = await getServerT();
    return (
      <>
        <PageBanner
          title={st("nav.historyAndTradition")}
          breadcrumbs={[{ label: st("nav.home"), href: "/" }, { label: st("nav.historyAndTradition") }]}
        />
         <div className="flex gap-4 max-w-7xl mx-auto py-10 px-2 flex-col sm:flex-row">
          <div className="sm:w-1/3 w-full">
            <PageSidebar />
          </div>
          <div className="sm:w-2/3 w-full">
             <PageContent />
          </div>
        </div>
      </>
    )
  }