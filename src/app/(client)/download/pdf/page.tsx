import { PageBanner } from "@/components/layout/page-banner";
import { PageGridContent } from "../../components/page-grid-content";

export default async function DownloadPdfPage() {
  return (
    <>
      <PageBanner
        titleKey="breadcrumbs.downloadPdf"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.downloadPdf" }]}
      />
      <div className="max-w-7xl mx-auto py-10 px-2">
             <PageGridContent />
        </div>
    </>
  )
}
