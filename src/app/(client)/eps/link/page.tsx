import { PageBanner } from "@/components/layout/page-banner";

export default function EPSLinkPage() {
    return (
      <>
        <PageBanner
          title="EPS Link"
          //subtitle="EPS Link"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "EPS Link" }]}
        />
        <div>
          <h1>EPS Link</h1>
        </div>
      </>
    )
  }