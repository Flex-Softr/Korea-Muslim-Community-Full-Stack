import type { ContactOccupationValue } from "@/lib/contact/occupations";

export type ContactSubmissionTemplateInput = {
  appName: string;
  fromName: string;
  mobileNumber: string;
  occupation: ContactOccupationValue;
  address: string;
  visaType: string;
  message: string;
};

const OCCUPATION_ADMIN_LABEL: Record<ContactOccupationValue, string> = {
  student: "Student",
  job_holder: "Job holder",
  eps: "EPS",
};

export function buildContactSubmissionEmail({
  appName,
  fromName,
  mobileNumber,
  occupation,
  address,
  visaType,
  message,
}: ContactSubmissionTemplateInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[${appName}] Contact: ${fromName}`;
  const occupationLabel = OCCUPATION_ADMIN_LABEL[occupation];

  const text = [
    `New message via ${appName} contact form.`,
    "",
    `Name: ${fromName}`,
    `Mobile: ${mobileNumber}`,
    `Occupation: ${occupationLabel}`,
    `Address: ${address}`,
    `Visa type: ${visaType}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>New message via <strong>${escapeHtml(appName)}</strong> contact form.</p>
  <ul style="list-style:none;padding:0;margin:0 0 16px;">
    <li><strong>Name:</strong> ${escapeHtml(fromName)}</li>
    <li><strong>Mobile:</strong> ${escapeHtml(mobileNumber)}</li>
    <li><strong>Occupation:</strong> ${escapeHtml(occupationLabel)}</li>
    <li><strong>Address:</strong> ${escapeHtml(address)}</li>
    <li><strong>Visa type:</strong> ${escapeHtml(visaType)}</li>
  </ul>
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
  <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;">${escapeHtml(message)}</pre>
</body>
</html>`.trim();

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
