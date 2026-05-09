import { PageBanner } from "@/components/layout/page-banner";
import { PageSidebar } from "../../components/page-sidebar";
import { PageContent } from "../../components/page-content";

export default function DownloadPosterPage() {
    return (
      <>
        <PageBanner
          title="Download Poster"
          //subtitle="Download Poster"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Download Poster" }]}
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