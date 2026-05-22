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
    const subtotal = parseFloat(invoice.nominal_tagihan);
    const biayaAdmin = parseFloat(invoice.biaya_admin);
    const ppnAmount = parseFloat(invoice.ppn_amount);
    const totalAkhir = parseFloat(invoice.total_nominal);
    const ppnRate = parseFloat(invoice.ppn);
    const invNumber = "INV-" + String(invoice.id).padStart(4, "0");

    const items = `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;">
          Modal Investasi — ${negosiasi.bisnis?.nama || invoice.detail_pengajuan?.nama_bisnis || "Seri A"}<br/>
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

    const html = Loader.loadTemplate("invoice", {
      nama,
      invoiceNumber: invNumber,
      invoiceUrl: `${process.env.FRONTEND_URL}/investor/invoice/${invoice.id}`,
      tanggalInvoice: formatDate(invoice.created_at),
      jatuhTempo: formatDate(invoice.tenggat_waktu),
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
      items,
      subtotal: formatRupiah(subtotal),
      diskon: formatRupiah(0),
      ppn: `${ppnRate.toFixed(0)}% dari biaya admin — ${formatRupiah(ppnAmount)}`,
      totalAkhir: formatRupiah(totalAkhir),
      metodePembayaran: invoice.kode_pembayaran,
      emailSupport: process.env.SUPPORT_EMAIL || "support@kelpstones.id",
      alamatPerusahaan: process.env.COMPANY_ADDRESS || "Jakarta, Indonesia",
      unsubscribeUrl: "#",
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
    logger.error("Error sending invoice email:", {
      err: { message: error.message, code: error.code },
    });
    throw error;
  }
};

const sendNegotiationStartEmail = async (
  to,
  nama,
  { bisnis_nama, penawaran_nominal, penawaran_return, catatan, negosiasi_id },
) => {
  try {
    const negosiasi_url = `${process.env.FRONTEND_URL}/umkm/negosiasi/${negosiasi_id}`;
    const html = Loader.loadTemplate("negosiasiStart", {
      nama,
      bisnis_nama,
      penawaran_nominal: formatRupiah(parseFloat(penawaran_nominal)),
      penawaran_return,
      catatan: catatan || "-",
      negosiasi_url,
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
    });
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `📋 Penawaran Investasi Baru untuk ${bisnis_nama}`,
      html,
    });
    logger.info(`Negotiation start email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending negotiation start email:", { error });
    throw error;
  }
};

const sendNegotiationReplyEmail = async (
  to,
  nama,
  {
    bisnis_nama,
    penawaran_nominal,
    penawaran_return,
    catatan,
    negosiasi_id,
    diajukan_oleh,
  },
) => {
  try {
    const pengirim = diajukan_oleh === "investor" ? "Investor" : "UMKM";
    const recipientPath = diajukan_oleh === "investor" ? "umkm" : "investor";
    const negosiasi_url = `${process.env.FRONTEND_URL}/${recipientPath}/negosiasi/${negosiasi_id}`;
    const html = Loader.loadTemplate("negosiasiReply", {
      nama,
      bisnis_nama,
      penawaran_nominal: formatRupiah(parseFloat(penawaran_nominal)),
      penawaran_return,
      catatan: catatan || "-",
      diajukan_oleh: pengirim,
      negosiasi_url,
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
    });
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `💬 Penawaran Baru dari ${pengirim} — ${bisnis_nama}`,
      html,
    });
    logger.info(`Negotiation reply email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending negotiation reply email:", { error });
    throw error;
  }
};

const sendNegotiationDealEmail = async (
  to,
  nama,
  { bisnis_nama, penawaran_nominal, penawaran_return, negosiasi_id },
) => {
  try {
    const negosiasi_url = `${process.env.FRONTEND_URL}/umkm/negosiasi/${negosiasi_id}`;
    const html = Loader.loadTemplate("negosiasiDeal", {
      nama,
      bisnis_nama,
      penawaran_nominal: formatRupiah(parseFloat(penawaran_nominal)),
      penawaran_return,
      negosiasi_url,
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
    });
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `🎉 Selamat! Negosiasi untuk ${bisnis_nama} Berhasil Deal`,
      html,
    });
    logger.info(`Negotiation deal email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending negotiation deal email:", { error });
    throw error;
  }
};

const sendNegotiationRejectedEmail = async (
  to,
  nama,
  { bisnis_nama, catatan, negosiasi_id },
) => {
  try {
    const dashboard_url = `${process.env.FRONTEND_URL}/dashboard`;
    const html = Loader.loadTemplate("negosiasiRejected", {
      nama,
      bisnis_nama,
      catatan: catatan || "Tidak ada keterangan.",
      dashboard_url,
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
    });
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `❌ Negosiasi untuk ${bisnis_nama} Ditolak`,
      html,
    });
    logger.info(`Negotiation rejected email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending negotiation rejected email:", { error });
    throw error;
  }
};

const sendTopUpPendingEmail = async (to, nama, { nominal, paymentUrl, externalId, tanggal }) => {
  try {
    const html = Loader.loadTemplate("topUpPending", {
      nama,
      nominal: formatRupiah(parseFloat(nominal)),
      paymentUrl,
      externalId,
      tanggal: formatDate(tanggal),
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
      emailSupport: process.env.SUPPORT_EMAIL || "support@kelpstones.id",
      alamatPerusahaan: process.env.COMPANY_ADDRESS || "Jakarta, Indonesia",
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `[PENDING] Tagihan Top Up Saldo — ${externalId}`,
      html,
    });

    logger.info(`Top up pending email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending top up pending email:", { error });
    throw error;
  }
};

const sendTopUpSuccessEmail = async (to, nama, { nominal, saldoSaatIni, externalId, tanggal }) => {
  try {
    const html = Loader.loadTemplate("topUpSuccess", {
      nama,
      nominal: formatRupiah(parseFloat(nominal)),
      saldoSaatIni: formatRupiah(parseFloat(saldoSaatIni)),
      externalId,
      tanggal: formatDate(tanggal),
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
      emailSupport: process.env.SUPPORT_EMAIL || "support@kelpstones.id",
      alamatPerusahaan: process.env.COMPANY_ADDRESS || "Jakarta, Indonesia",
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `[SUKSES] Top Up Saldo Berhasil — ${externalId}`,
      html,
    });

    logger.info(`Top up success email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending top up success email:", { error });
    throw error;
  }
};

const sendWithdrawalPendingEmail = async (to, nama, { nominal, externalId, tanggal }) => {
  try {
    const html = Loader.loadTemplate("withdrawalPending", {
      nama,
      nominal: formatRupiah(parseFloat(nominal)),
      externalId,
      tanggal: formatDate(tanggal),
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
      emailSupport: process.env.SUPPORT_EMAIL || "support@kelpstones.id",
      alamatPerusahaan: process.env.COMPANY_ADDRESS || "Jakarta, Indonesia",
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `[PROSES] Permintaan Penarikan Dana — ${externalId}`,
      html,
    });

    logger.info(`Withdrawal pending email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending withdrawal pending email:", { error });
    throw error;
  }
};

const sendWithdrawalSuccessEmail = async (to, nama, { nominal, externalId, tanggal }) => {
  try {
    const html = Loader.loadTemplate("withdrawalSuccess", {
      nama,
      nominal: formatRupiah(parseFloat(nominal)),
      externalId,
      tanggal: formatDate(tanggal),
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
      emailSupport: process.env.SUPPORT_EMAIL || "support@kelpstones.id",
      alamatPerusahaan: process.env.COMPANY_ADDRESS || "Jakarta, Indonesia",
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `[SUKSES] Penarikan Dana Berhasil — ${externalId}`,
      html,
    });

    logger.info(`Withdrawal success email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending withdrawal success email:", { error });
    throw error;
  }
};

const sendWithdrawalFailedEmail = async (to, nama, { nominal, saldoSaatIni, externalId, tanggal, alasan }) => {
  try {
    const html = Loader.loadTemplate("withdrawalFailed", {
      nama,
      nominal: formatRupiah(parseFloat(nominal)),
      saldoSaatIni: formatRupiah(parseFloat(saldoSaatIni)),
      externalId,
      tanggal: formatDate(tanggal),
      alasan: alasan || "Tidak ada alasan spesifik.",
      companyName: process.env.SMTP_FROM_NAME || "Kelpstones",
      emailSupport: process.env.SUPPORT_EMAIL || "support@kelpstones.id",
      alamatPerusahaan: process.env.COMPANY_ADDRESS || "Jakarta, Indonesia",
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: `[DITOLAK] Penarikan Dana Gagal/Ditolak — ${externalId}`,
      html,
    });

    logger.info(`Withdrawal failed email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Error sending withdrawal failed email:", { error });
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
  sendNegotiationStartEmail,
  sendNegotiationReplyEmail,
  sendNegotiationDealEmail,
  sendNegotiationRejectedEmail,
  sendTopUpPendingEmail,
  sendTopUpSuccessEmail,
  sendWithdrawalPendingEmail,
  sendWithdrawalSuccessEmail,
  sendWithdrawalFailedEmail,
};
