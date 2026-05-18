import { PageBanner } from "@/components/layout/page-banner";
import { getServerT } from "@/lib/i18n/server-translate";

export default async function EPSFormPage() {
  const st = await getServerT();
    return (
      <>
        <PageBanner
          titleKey="breadcrumbs.epsForm"
          breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.epsForm" }]}
        />
        <div>
        <h1>{st("breadcrumbs.epsForm")}</h1>
      </div>
      </>
    )
  }