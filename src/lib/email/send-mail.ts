import "server-only";

import nodemailer from "nodemailer";
import { env } from "@/config/env";

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

async function sendViaSmtp(input: SendMailInput): Promise<void> {
  const port = env.SMTP_PORT ?? 587;
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST!,
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASSWORD!,
    },
  });

  await transporter.sendMail({
    from: env.EMAIL_FROM!,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

/**
 * Sends email via SMTP (Nodemailer).
 * If SMTP + EMAIL_FROM are not set, logs in development only.
 */
export async function sendMail(input: SendMailInput): Promise<void> {
  if (
    env.SMTP_HOST &&
    env.SMTP_USER &&
    env.SMTP_PASSWORD &&
    env.EMAIL_FROM
  ) {
    await sendViaSmtp(input);
    return;
  }

  if (env.NODE_ENV === "development") {
    console.warn(
      "\n[email] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM) — dev log only:\n",
    );
    console.warn("  To:", input.to);
    if (input.replyTo) console.warn("  Reply-To:", input.replyTo);
    console.warn("  Subject:", input.subject);
    console.warn("  --- text ---\n", input.text, "\n");
    return;
  }

  throw new Error(
    "Email is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM.",
  );
}
