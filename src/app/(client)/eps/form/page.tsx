import { PageBanner } from "@/components/layout/page-banner";
import { getServerT } from "@/lib/i18n/server-translate";

export default async function EPSFormPage() {
  const st = await getServerT();
    return (
      <>
        <PageBanner
          title={st("breadcrumbs.epsForm")}
          breadcrumbs={[{ label: st("nav.home"), href: "/" }, { label: st("breadcrumbs.epsForm") }]}
        />
        <div>
        <h1>{st("breadcrumbs.epsForm")}</h1>
      </div>
      </>
    )
  }