import { PageBanner } from "@/components/layout/page-banner";
import { OrganizationalMethodView } from "./components/organizational-method-view";

export default async function OrganizationalMethodPage() {
  return (
    <>
      <PageBanner
        titleKey="nav.organizationalMethod"
        breadcrumbs={[
          { labelKey: "nav.home", href: "/" },
          { labelKey: "nav.introduction", href: "/introduction/brief-introduction" },
          { labelKey: "nav.organizationalMethod" },
        ]}
      />
      <OrganizationalMethodView />
    </>
  );
}
