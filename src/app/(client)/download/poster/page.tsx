import { PageBanner } from "@/components/layout/page-banner";
import { PageGridContent } from "../../components/page-grid-content";

export default async function DownloadPosterPage() {
  return (
      <>
        <PageBanner
          titleKey="breadcrumbs.downloadPoster"
          breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.downloadPoster" }]}
        />
          <div className="max-w-7xl mx-auto py-10 px-2">
             <PageGridContent />
        </div>
      </>
    )
  }
