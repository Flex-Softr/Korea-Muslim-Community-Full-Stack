import { PageBanner } from "@/components/layout/page-banner";
import { PageContent } from "../components/page-content";
import { PageSidebar } from "../components/page-sidebar";

export default function StudentsPage() {
    return (
      <>
        <PageBanner
          title="Students"
          //subtitle="Students"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Students" }]}
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