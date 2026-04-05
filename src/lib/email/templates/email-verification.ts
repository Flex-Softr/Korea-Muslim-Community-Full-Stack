export type EmailVerificationTemplateInput = {
  appName: string;
  verifyUrl: string;
};

export function buildEmailVerificationEmail({
  appName,
  verifyUrl,
}: EmailVerificationTemplateInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Verify your ${appName} email`;

  const text = [
    `Confirm your email for ${appName}.`,
    "",
    `Open this link (valid for 24 hours):`,
    verifyUrl,
    "",
    `If you did not create an account, you can ignore this email.`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Confirm your email for <strong>${escapeHtml(appName)}</strong>.</p>
  <p><a href="${escapeAttr(verifyUrl)}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">Verify email</a></p>
  <p style="font-size:14px;color:#666;">Or copy this link:</p>
  <p style="font-size:13px;word-break:break-all;color:#444;">${escapeHtml(verifyUrl)}</p>
  <p style="font-size:13px;color:#666;">This link expires in <strong>24 hours</strong>. If you did not sign up, ignore this email.</p>
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
