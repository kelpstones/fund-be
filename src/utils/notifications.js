const Notifications = require("../models/notifications");
const admins = require("../models/admins");
const { NotificationValidator } = require("../validation");
const pengajuans = require("../models/pengajuans");
const bisnis = require("../models/bisnis");
exports.notifyAdminNewPengajuan = async (bisnis_id, pengajuans_id) => {
  try {
    const allAdmins = await admins.getAllAdmins(1, 100);
    // const admin_id = allAdmins.map((admin) => admin.id);
    const notificationPromises = allAdmins.map((admin) =>
      Notifications.createNotification(
        null,
        admin.id,
        "New Pengajuan Created",
        `A new pengajuan has been created for bisnis ID ${bisnis_id} with pengajuan ID ${pengajuans_id}.`,
        "pengajuan",
        pengajuans_id,
      ),
    );
    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error notifying admin about new pengajuan:", error);
    throw error;
  }
};

exports.notifyUserPengajuanStatus = async (pengajuans_id, status) => {
  try {
    const pengajuan = await pengajuans.getPengajuanById(pengajuans_id);
    const bisnisData = await bisnis.getBisnisById(pengajuan.bisnis_id);

    const validate = NotificationValidator.notificationValidation({
      title: `Pengajuan Status Update`,
      message: `Your pengajuan for bisnis "${bisnisData.nama_bisnis}" has been ${status}.`,
      type: "pengajuan_status",
      reference_id: pengajuans_id,
      user_id: bisnisData.user_id,
    });

    if (validate.error) {
      throw new Error(validate.error.details[0].message);
    }

    await Notifications.createNotification(
      bisnisData.user_id,
      null,
      "Pengajuan Status Update",
      `Your pengajuan for bisnis "${bisnisData.nama_bisnis}" has been ${status}.`,
      "pengajuan_status",
      pengajuans_id,
    );
  } catch (error) {
    console.error("Error notifying user about pengajuan status update:", error);
    throw error;
  }
};

exports.notifyStartNegotiation = async (
  pengajuan_id,
  negosiasi_id,
  penawaran_return,
) => {
  try {
    const pengajuan = await pengajuans.getPengajuanById(pengajuan_id);
    const bisnisData = await bisnis.getBisnisById(pengajuan.bisnis_id);

    const title = "New Negotiation Started";
    const message = `A new negotiation has been started for your pengajuan "${bisnisData.nama_bisnis}". Latest offer: ${penawaran_return}% return.`;

    await Notifications.createNotification(
      bisnisData.user_id,
      null,
      title,
      message,
      "negosiasi",
      negosiasi_id,
    );
  } catch (error) {
    console.error("Error notifying UMKM about negosiasi update:", error);
  }
};

exports.notifyReplyNegotiation = async (
  investor_id,
  negosiasi_id,
  action,
  catatan,
) => {
  try {
    let title = "Negosiasi Update";
    let message = `Your negosiasi has a new update: ${action}. ${catatan ? `Note: ${catatan}` : ""}`;

    if (action === "deal") {
      title = "Negosiasi Deal";
      message = `Congratulations! Your negosiasi has been marked as a deal. ${catatan ? `Note: ${catatan}` : ""} Please proceed with the next steps.`;
    } else if (action === "rejected") {
      title = "Negosiasi Rejected";
      message = `Unfortunately, your negosiasi has been rejected. ${catatan ? `Note: ${catatan}` : ""}`;
    } else if (action === "reply") {
      title = "New Reply on Your Negosiasi";
      message = `You have a new reply on your negosiasi. ${catatan ? `Note: ${catatan}` : ""}`;
    }

    await Notifications.createNotification(
      investor_id,
      null,
      title,
      message,
      "negosiasi",
      negosiasi_id,
    );
  } catch (error) {
    console.error("Error notifying investor about negosiasi update:", error);
  }
};
