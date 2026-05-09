import { PageBanner } from "@/components/layout/page-banner";

export default function EPSAppPage() {
    return (
      <>
        <PageBanner
          title="EPS App"
          //subtitle="EPS App"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "EPS App" }]}
        />
        <div>
          <h1>EPS App</h1>
        </div>
      </>
      
    )
  }