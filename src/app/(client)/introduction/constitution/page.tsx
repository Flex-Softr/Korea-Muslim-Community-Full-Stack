import { PageBanner } from "@/components/layout/page-banner";
import { ConstitutionView } from "./components/constitution-view";

export default async function ConstitutionPage() {
  return (
    <>
      <PageBanner
        titleKey="nav.constitution"
        breadcrumbs={[
          { labelKey: "nav.home", href: "/" },
          { labelKey: "nav.introduction", href: "/introduction/brief-introduction" },
          { labelKey: "nav.constitution" },
        ]}
      />
      <ConstitutionView />
    </>
  );
}
