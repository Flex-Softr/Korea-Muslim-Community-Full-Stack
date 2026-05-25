import { PageBanner } from "@/components/layout/page-banner";
import { PageGridContent } from "../../components/page-grid-content";
import { PageSidebar } from "../../components/page-sidebar";

export default async function DownloadBookPage() {
  return (
      <>
        <PageBanner
          titleKey="breadcrumbs.downloadBook"
          breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.downloadBook" }]}
        />
          <div className="flex gap-4 max-w-7xl mx-auto py-10 px-2 flex-col sm:flex-row">
          <div className="sm:w-1/3 w-full">
            <PageSidebar />
          </div>
          <div className="sm:w-2/3 w-full">
            <PageGridContent />
          </div>
        </div>
      </>
    )
  }