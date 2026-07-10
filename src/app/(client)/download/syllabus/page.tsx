import { PageBanner } from "@/components/layout/page-banner";
import { PageGridContent } from "../../components/page-grid-content";

export default async function DownloadSyllabusPage() {
  return (
      <>
      <PageBanner
        titleKey="breadcrumbs.downloadSyllabus"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.downloadSyllabus" }]}
      />
        <div className="max-w-7xl mx-auto py-10 px-2">
             <PageGridContent />
        </div>
    </>
    )
  }
