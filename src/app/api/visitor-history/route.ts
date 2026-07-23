import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";

let token: null | string = null;

async function getVisitorsByCountry(token: string) {
  const propertyId = process.env.GA4_PROPERTY_ID;

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "365daysAgo", endDate: "today" }],
        dimensions: [{ name: "country" }, { name: "countryId" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GA4 API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitors = (data.rows || []).map((row: any) => ({
    country: row.dimensionValues[0].value,
    countryId: row.dimensionValues[1].value,
    activeUsers: Number(row.metricValues[0].value),
  }));

  return visitors;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  const privateKey = process.env.GA_PRIVATE_KEY;
  const email = process.env.GA_CLIENT_EMAIL;

  if (!token) {
    const auth = new GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const client = await auth.getClient();
    token = (await client.getAccessToken()).token || null;

    if (!token) {
      return NextResponse.json({
        status: 500,
        message: "Google auth failed.",
      });
    }
  }

  const data = await getVisitorsByCountry(token);

  return NextResponse.json({
    status: 200,
    message: "OK",
    data,
  });
}
