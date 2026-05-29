import nodemailer from "nodemailer";
import { Resend } from "resend";

const sendEmail = async (options) => {
  // ── Priority 1: Resend API (best for serverless / Vercel) ──
  if (process.env.RESEND_API_KEY) {
    console.log("Using Resend Email Service");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const senderEmail =
      process.env.RESEND_FROM_EMAIL || process.env.SENDER_EMAIL || process.env.EMAIL_USERNAME;

    if (!senderEmail || !senderEmail.includes("@")) {
      console.error(`❌ ERROR: Invalid Sender Email: '${senderEmail}'`);
      throw new Error(
        "Invalid Sender Email configuration for Resend: Email must contain '@'"
      );
    }

    // Resend requires a verified domain or onboarding@resend.dev for testing
    const fromField = `Budgetly App <${senderEmail}>`;

    const payload = {
      from: fromField,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || undefined,
    };

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error("❌ Resend send error:", error);
      throw new Error(`Resend failed: ${error.message}`);
    }

    console.log(`✅ Email sent via Resend — ID: ${data.id}`);
    return;
  }

  // ── Priority 2: Custom SMTP ──
  const hasSMTP =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    (process.env.SMTP_EMAIL || process.env.EMAIL_USERNAME) &&
    (process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD);

  // ── Priority 3: Gmail SMTP ──
  const hasGmail = process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD;

  if (!hasSMTP && !hasGmail) {
    console.log(
      "⚠️ No Email Service Configured (Resend, Gmail, or Custom SMTP). Email content:"
    );
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return;
  }

  let transporter;

  if (hasSMTP) {
    console.log(
      `Using Custom SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
    );
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_EMAIL || process.env.EMAIL_USERNAME,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
      },
      // Longer timeout for serverless cold starts
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  } else {
    console.log("Using Gmail Service");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  const senderEmail =
    process.env.SENDER_EMAIL ||
    process.env.SMTP_EMAIL ||
    process.env.EMAIL_USERNAME;

  if (!senderEmail || !senderEmail.includes("@")) {
    console.error(`❌ ERROR: Invalid Sender Email: '${senderEmail}'`);
    console.error(
      "👉 Please set SENDER_EMAIL=your-verified-email@example.com in your server/.env file."
    );
    throw new Error(
      "Invalid Sender Email configuration: Email must contain '@'"
    );
  }

  console.log(`Attempting to send email from: ${senderEmail}`);

  const mailOptions = {
    from: `Budgetly App <${senderEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent via SMTP to: ${options.email}`);
};

export default sendEmail;
