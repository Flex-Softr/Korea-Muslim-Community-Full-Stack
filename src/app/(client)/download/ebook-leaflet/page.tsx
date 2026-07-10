import { PageBanner } from "@/components/layout/page-banner";
import { PageGridContent } from "../../components/page-grid-content";

export default async function DownloadEbookLeafletPage() {
  return (
      <>
        <PageBanner
          titleKey="breadcrumbs.downloadEbookLeaflet"
          breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.downloadEbookLeaflet" }]}
        />
         <div className="max-w-7xl mx-auto py-10 px-2">
             <PageGridContent />
        </div>
      </>
    )
  }
