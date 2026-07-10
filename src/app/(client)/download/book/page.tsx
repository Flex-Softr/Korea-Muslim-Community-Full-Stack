import { PageBanner } from "@/components/layout/page-banner";
import { PageGridContent } from "../../components/page-grid-content";

export default async function DownloadBookPage() {
  return (
      <>
        <PageBanner
          titleKey="breadcrumbs.downloadBook"
          breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.downloadBook" }]}
        />
          <div className="max-w-7xl mx-auto py-10 px-2">
            <PageGridContent />
        </div>
      </>
    )
  }
