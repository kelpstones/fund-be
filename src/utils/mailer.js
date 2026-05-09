const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Loader = require("./loadTemplate");
const logger = require("./logger");
// const { HelpersUtils } = require("./index");
const { formatRupiah, formatDate } = require("./helpers");
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
    logger.info("Verification email sent:", { messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error("Error sending verification email:", { error });
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
    logger.info("Password reset email sent:", { messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error("Error sending password reset email:", { error });
    throw error;
  }
};

const sendInvoiceEmail = async (to, nama, invoice, negosiasi = {}) => {
  try {
    const subtotal    = parseFloat(invoice.nominal_tagihan);
    const biayaAdmin  = parseFloat(invoice.biaya_admin);
    const ppnAmount   = parseFloat(invoice.ppn_amount);
    const totalAkhir  = parseFloat(invoice.total_nominal);
    const ppnRate     = parseFloat(invoice.ppn);
    const invNumber   = 'INV-' + String(invoice.id).padStart(4, '0');

    const items = `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;">
          Modal Investasi — ${negosiasi.bisnis?.nama || invoice.detail_pengajuan?.nama_bisnis || 'Seri A'}<br/>
          <small style="color:#999;">Negosiasi #${negosiasi.id} · Pengajuan #${invoice.detail_pengajuan?.id}</small>
        </td>
        <td style="padding:12px 16px;text-align:right;border-bottom:1px solid #eee;font-weight:500;">
          ${formatRupiah(subtotal)}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;">
          Biaya Admin (${process.env.ADMIN_FEE_RATE || 1}%)
        </td>
        <td style="padding:12px 16px;text-align:right;border-bottom:1px solid #eee;">
          ${formatRupiah(biayaAdmin)}
        </td>
      </tr>`;

    const html = Loader.loadTemplate('invoice', {
      nama,
      invoiceNumber: invNumber,
      invoiceUrl: `${process.env.FRONTEND_URL}/investor/invoice/${invoice.id}`,
      tanggalInvoice: formatDate(invoice.created_at),
      jatuhTempo: formatDate(invoice.tenggat_waktu),
      companyName: process.env.SMTP_FROM_NAME || 'Kelpstones',
      items,
      subtotal: formatRupiah(subtotal),
      diskon: formatRupiah(0),
      ppn: `${ppnRate.toFixed(0)}% dari biaya admin — ${formatRupiah(ppnAmount)}`,
      totalAkhir: formatRupiah(totalAkhir),
      metodePembayaran: invoice.kode_pembayaran,
      emailSupport: process.env.SUPPORT_EMAIL || 'support@kelpstones.id',
      alamatPerusahaan: process.env.COMPANY_ADDRESS || 'Jakarta, Indonesia',
      unsubscribeUrl: '#',
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `[${invNumber}] Invoice Investasi — Jatuh Tempo ${formatDate(invoice.tenggat_waktu)}`,
      html,
    });

    logger.info(`Invoice email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending invoice email:', {
      err: { message: error.message, code: error.code }
    });
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
};
