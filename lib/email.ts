import nodemailer from "nodemailer";

type MailResult = {
  delivered: boolean;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  if (!host || !port || !user || !pass || !from) {
    return null;
  }
  return { host, port, user, pass, from };
}

export async function sendOtpEmail(to: string, otp: string): Promise<MailResult> {
  const cfg = getSmtpConfig();
  if (!cfg) {
    return { delivered: false };
  }
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  await transporter.sendMail({
    from: cfg.from,
    to,
    subject: "Your PrimeTrade verification code",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>.</p><p>It expires in 10 minutes.</p>`,
  });
  return { delivered: true };
}
