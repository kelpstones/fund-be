const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const loadTemplate = (templateName, variables = {}) => {
  const templatePath = path.join(
    __dirname,
    "emailTemplates",
    `${templateName}.html`,
  );
  let html = fs.readFileSync(templatePath, "utf-8");

  // Replace semua {{placeholder}}
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value);
  });

  return html;
};

const sendVerificationEmail = async (to, nama, token) => {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = loadTemplate("verifyEmail", { nama, verifyUrl });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: "Verifikasi Email Kamu",
      html,
    });
    console.log("Verification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (to, nama, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = loadTemplate("passwordReset", { nama, resetUrl });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: "Reset Password",
      html,
    });
    console.log("Password reset email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
