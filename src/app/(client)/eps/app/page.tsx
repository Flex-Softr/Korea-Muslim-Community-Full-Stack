import { PageBanner } from "@/components/layout/page-banner";
import { getServerT } from "@/lib/i18n/server-translate";

export default async function EPSAppPage() {
  const st = await getServerT();
    return (
      <>
        <PageBanner
          title={st("breadcrumbs.epsApp")}
          breadcrumbs={[{ label: st("nav.home"), href: "/" }, { label: st("breadcrumbs.epsApp") }]}
        />
        <div>
          <h1>{st("breadcrumbs.epsApp")}</h1>
        </div>
      </>
      
    )
  }