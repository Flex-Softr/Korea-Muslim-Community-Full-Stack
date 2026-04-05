export type ContactSubmissionTemplateInput = {
  appName: string;
  fromName: string;
  fromEmail: string;
  message: string;
};

export function buildContactSubmissionEmail({
  appName,
  fromName,
  fromEmail,
  message,
}: ContactSubmissionTemplateInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[${appName}] Contact: ${fromName}`;

  const text = [
    `New message via ${appName} contact form.`,
    "",
    `From: ${fromName} <${fromEmail}>`,
    "",
    message,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>New message via <strong>${escapeHtml(appName)}</strong> contact form.</p>
  <p><strong>From:</strong> ${escapeHtml(fromName)}<br/>
  <a href="mailto:${escapeAttr(fromEmail)}">${escapeHtml(fromEmail)}</a></p>
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

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
