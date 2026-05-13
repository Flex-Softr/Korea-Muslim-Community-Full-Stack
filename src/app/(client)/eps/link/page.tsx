import { PageBanner } from "@/components/layout/page-banner";
import { getServerT } from "@/lib/i18n/server-translate";

export default async function EPSLinkPage() {
  const st = await getServerT();
    return (
      <>
        <PageBanner
          title={st("breadcrumbs.epsLink")}
          breadcrumbs={[{ label: st("nav.home"), href: "/" }, { label: st("breadcrumbs.epsLink") }]}
        />
        <div>
          <h1>{st("breadcrumbs.epsLink")}</h1>
        </div>
      </>
    )
  }