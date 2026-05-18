import { PageBanner } from "@/components/layout/page-banner";
import { PageContent } from "../../components/page-content";
import { PageSidebar } from "../../components/page-sidebar";

export default async function BriefIntroductionPage() {
  return (
      <>
        <PageBanner
          titleKey="nav.briefIntroduction"
          breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "nav.briefIntroduction" }]}
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