import { PageBanner } from "@/components/layout/page-banner";
import { getServerT } from "@/lib/i18n/server-translate";

export default async function EPSAppPage() {
  const st = await getServerT();
    return (
      <>
        <PageBanner
          titleKey="breadcrumbs.epsApp"
          breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.epsApp" }]}
        />
        <div>
          <h1>{st("breadcrumbs.epsApp")}</h1>
        </div>
      </>
      
    )
  }