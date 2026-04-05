export type PasswordResetTemplateInput = {
  appName: string;
  resetUrl: string;
};

export function buildPasswordResetEmail({
  appName,
  resetUrl,
}: PasswordResetTemplateInput): { subject: string; html: string; text: string } {
  const subject = `Reset your ${appName} password`;

  const text = [
    `You asked to reset your password for ${appName}.`,
    "",
    `Open this link (valid for 1 hour):`,
    resetUrl,
    "",
    `If you did not request this, you can ignore this email.`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>You asked to reset your password for <strong>${escapeHtml(appName)}</strong>.</p>
  <p><a href="${escapeAttr(resetUrl)}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">Reset password</a></p>
  <p style="font-size:14px;color:#666;">Or copy this link:</p>
  <p style="font-size:13px;word-break:break-all;color:#444;">${escapeHtml(resetUrl)}</p>
  <p style="font-size:13px;color:#666;">This link expires in <strong>1 hour</strong>. If you did not request a reset, ignore this email.</p>
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
