import { PageBanner } from "@/components/layout/page-banner";

export default function EPSFormPage() {
    return (
      <>
        <PageBanner
          title="EPS Form"
          //subtitle="EPS Form"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "EPS Form" }]}
        />
        <div>
        <h1>EPS Form</h1>
      </div>
      </>
    )
  }