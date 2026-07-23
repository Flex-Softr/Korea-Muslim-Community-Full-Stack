import { GoogleTagManager } from "@next/third-parties/google";

const GTMInit = () => {
  const gtmId = process.env.GTM_ID;

  if (!gtmId) return null;

  return <GoogleTagManager gtmId={gtmId} />;
};

export default GTMInit;
