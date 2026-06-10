import nodemailer from "nodemailer";

interface SendEmailOptions {
  to?: string | string[];
  bcc?: string | string[];
  subject: string;
  text: string;
  html?: string;
}

function getSender() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || "";
}

function getTransportConfig() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;

  if (host) {
    return {
      host,
      port: port || 587,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user, pass },
    };
  }

  return {
    service: process.env.SMTP_SERVICE || "gmail",
    auth: { user, pass },
  };
}

function normalizeRecipients(recipients?: string | string[]) {
  if (!recipients) return [];
  return (Array.isArray(recipients) ? recipients : [recipients])
    .map((recipient) => recipient.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailConfigured() {
  return Boolean(getTransportConfig() && getSender());
}

export function textToHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\r?\n/g, "<br />");
}

export async function sendEmail({ to, bcc, subject, text, html }: SendEmailOptions) {
  const transportConfig = getTransportConfig();
  const from = getSender();

  if (!transportConfig || !from) {
    throw new Error("SMTP is not configured. Set SMTP_USER and SMTP_PASS.");
  }

  const toRecipients = normalizeRecipients(to);
  const bccRecipients = normalizeRecipients(bcc);

  if (toRecipients.length === 0 && bccRecipients.length === 0) {
    return { accepted: 0, rejected: 0 };
  }

  const transporter = nodemailer.createTransport(transportConfig);
  const result = await transporter.sendMail({
    from: `"JobAlert BD" <${from}>`,
    to: toRecipients.length > 0 ? toRecipients : undefined,
    bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
    subject,
    text,
    html: html || textToHtml(text),
  });

  return {
    accepted: result.accepted.length,
    rejected: result.rejected.length,
  };
}
