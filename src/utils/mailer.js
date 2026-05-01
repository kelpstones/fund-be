const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const loadTemplate = (templateName, variables = {}) => {
  const templatePath = path.join(__dirname, "emailTemplates", `${templateName}.html`);
  let html = fs.readFileSync(templatePath, "utf-8");

  // Replace semua {{placeholder}}
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value);
  });

  return html;
};

const sendVerificationEmail = async (to, nama, token) => {
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

  const html = loadTemplate("verifyEmail", { nama, verifyUrl });

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
    to,
    subject: "Verifikasi Email Kamu",
    html,
  });
};

module.exports = { sendVerificationEmail };