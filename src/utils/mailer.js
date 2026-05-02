const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Loader = require("./loadTemplate");
const { Helpers } = require(".");
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

const sendInvoiceEmail = async (to, nama, invoice, negosiasi = {}) => {
  try {
    const subtotal = parseFloat(invoice.nominal_tagihan);
    const ppnRate = parseFloat(invoice.ppn);
    const ppnAmount = subtotal * (ppnRate / 100);
    const totalAkhir = subtotal + ppnAmount;
    const invNumber = "INV-" + String(invoice.id).padStart(4, "0");

    // Satu baris item sebagai string HTML (sesuai kontrak Loader)
    const items = `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;">
          Investasi Dana — ${negosiasi.nama_usaha || "Seri A"}<br/>
          <small style="color:#999;">Negosiasi #${invoice.negosiasi_id} · Pengajuan #${invoice.pengajuan_id}</small>
        </td>
        <td style="padding:12px 16px;text-align:right;border-bottom:1px solid #eee;font-weight:500;">
          ${Helpers.formatRupiah(subtotal)}
        </td>
      </tr>`;

    const html = Loader.loadTemplate("invoice", {
      nama,
      invoiceNumber: invNumber,
      invoiceUrl: `${process.env.FRONTEND_URL}/investor/invoice/${invoice.id}`,
      tanggalInvoice: Helpers.formatDate(invoice.created_at),
      jatuhTempo: Helpers.formatDate(invoice.tenggat_waktu),
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
      items, // string HTML <tr>...</tr>
      subtotal: Helpers.formatRupiah(subtotal),
      diskon: Helpers.formatRupiah(0), // belum ada field diskon di schema
      ppn: `${ppnRate.toFixed(0)}% — ${Helpers.formatRupiah(ppnAmount)}`,
      totalAkhir: Helpers.formatRupiah(totalAkhir),
      metodePembayaran: invoice.kode_pembayaran,
      emailSupport: process.env.SUPPORT_EMAIL || "support@kelpstones.id",
      alamatPerusahaan: process.env.COMPANY_ADDRESS || "Jakarta, Indonesia",
      unsubscribeUrl: "#",
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `[${invNumber}] Invoice Investasi — Jatuh Tempo ${Helpers.formatDate(invoice.tenggat_waktu)}`,
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
