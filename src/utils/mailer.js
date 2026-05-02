const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Loader = require("./loadTemplate");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (to, nama, token) => {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = Loader.loadTemplate("verifyEmail", { nama, verifyUrl });

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

    const html = Loader.loadTemplate("passwordReset", { nama, resetUrl });

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

const sendInvoiceEmail = async (to, nama, data) => {
  try {
    const html = Loader.loadTemplate("invoice", {
      nama: nama,
      invoiceUrl: data.invoiceUrl,
      nomorInvoice: data.nomorInvoice,
      tanggal: data.tanggal,
      tanggalInvoice: data.tanggalInvoice,
      jatuhTempo: data.jatuhTempo,
      metodePembayaran: "Transfer Bank",
      subtotal: "Rp 12.250.000",
      ppn: "Rp 1.347.500",
      diskon: "Rp 500.000",
      totalAkhir: "Rp 13.097.500",
      items: `<tr><td>Layanan Web</td><td style="text-align:center;">1</td><td>Rp 12.250.000</td></tr>`,
      companyName: "PT. Nama Kamu",
      emailSupport: "support@email.com",
      alamatPerusahaan: "Jl. Contoh, Depok",
      unsubscribeUrl: "#",
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: "Invoice Pembayaran",
      html,
    });
    console.log("Invoice email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
};
