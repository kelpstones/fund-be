const responseHelper = require("../utils/index").ResponseHelper;
const Bisnis = require("../models/bisnis");
const Pengajuan = require("../models/pengajuans");
const Investasi = require("../models/investasi");
const DistribusiProfit = require("../models/distribusi_profits");
const Users = require("../models/users");
const Penjualan = require("../models/penjualans");
const logger = require("../utils/index").logger;

class DashboardController {
  async getAdminDashboard(req, res) {
    try {
      const [
        bisnisList,
        userList,
        pengajuanList,
        investasiList,
        distribusiList,
      ] = await Promise.all([
        Bisnis.getAllBisnis(1, 9999),
        Users.getAllUsers(1, 9999),
        Pengajuan.getAllPengajuans(1, 9999),
        Investasi.getAllInvestasi(1, 9999),
        DistribusiProfit.getAll(1, 9999),
      ]);
      const pengajuanByStatus = pengajuanList.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});

      const totalNominalInvestasi = investasiList.reduce(
        (sum, i) => sum + parseFloat(i.nominal_investasi || 0),
        0,
      );

      const distribusiByStatus = distribusiList.reduce((acc, d) => {
        if (!acc[d.status]) acc[d.status] = { jumlah: 0, total_nominal: 0 };
        acc[d.status].jumlah += 1;
        acc[d.status].total_nominal += parseFloat(d.nominal_profit || 0);
        return acc;
      }, {});

      const recentPengajuan = pengajuanList.slice(0, 5);

      return responseHelper.success(
        res,
        "Admin dashboard fetched successfully",
        {
          bisnis: {
            total: bisnisList.length,
          },
          users: {
            total: userList.data.length,
          },
          pengajuan: {
            total: pengajuanList.length,
            by_status: pengajuanByStatus,
          },
          investasi: {
            total_nominal: totalNominalInvestasi,
          },
          distribusi_profit: {
            by_status: distribusiByStatus,
          },
          recent_pengajuan: recentPengajuan,
        },
      );
    } catch (error) {
      logger.error("An error occurred while fetching admin dashboard data", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching dashboard data",
      );
    }
  }

  async getInvestorDashboard(req, res) {
    try {
      const { id: investor_id } = req.user;
      const [investasiList, distribusiList] = await Promise.all([
        Investasi.getInvestasiByUserId(investor_id, "investor", 1, 9999),
        DistribusiProfit.getByInvestorId(investor_id, 1, 9999),
      ]);

      // Total nominal investasi
      const totalNominalInvestasi = investasiList.reduce(
        (sum, i) => sum + parseFloat(i.nominal_investasi || 0),
        0,
      );

      // Breakdown distribusi profit per status
      const distribusiByStatus = distribusiList.reduce((acc, d) => {
        if (!acc[d.status]) acc[d.status] = { jumlah: 0, total_nominal: 0 };
        acc[d.status].jumlah += 1;
        acc[d.status].total_nominal += parseFloat(d.nominal_profit || 0);
        return acc;
      }, {});

      // 5 distribusi terbaru
      const recentDistribusi = distribusiList.slice(0, 5);

      return responseHelper.success(
        res,
        "Investor dashboard fetched successfully",
        {
          investasi: {
            total_nominal: totalNominalInvestasi,
            jumlah_aktif: investasiList.length,
          },
          profit: {
            total_diterima: distribusiByStatus?.distributed?.total_nominal || 0,
            total_pending: distribusiByStatus?.pending?.total_nominal || 0,
            by_status: distribusiByStatus,
          },
          recent_distribusi: recentDistribusi,
        },
      );
    } catch (error) {
      logger.error("An error occurred while fetching investor dashboard data", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching dashboard data",
      );
    }
  }

  async getBisnisDashboard(req, res) {
    try {
      const { id: user_id } = req.user;

      const bisnis = await Bisnis.getBisnisByUserId(user_id);
      if (!bisnis) {
        return responseHelper.error(res, "Bisnis not found", 404);
      }

      const [pengajuanResult, investasiList] = await Promise.all([
        Pengajuan.getPengajuanByBisnisId(bisnis.id),
        Investasi.getInvestasiByUserId(user_id, "bisnis", 1, 9999),
      ]);

      const pengajuanTerbaru = Array.isArray(pengajuanResult)
        ? pengajuanResult[0]
        : pengajuanResult;

      const penjualanChart = pengajuanTerbaru
        ? await Penjualan.getPenjualanByPengajuanId(pengajuanTerbaru.id)
        : [];

      const uniqueInvestorIds = [
        ...new Set(investasiList.map((i) => i.investor.id)),
      ];

      return responseHelper.success(
        res,
        "Bisnis dashboard fetched successfully",
        {
          bisnis: {
            id: bisnis.id,
            nama_bisnis: bisnis.nama_bisnis,
          },
          pengajuan: pengajuanTerbaru
            ? {
                id: pengajuanTerbaru.id,
                status: pengajuanTerbaru.status,
                target_pendanaan: pengajuanTerbaru.target_pendanaan,
                total_pendanaan: pengajuanTerbaru.total_pendanaan,
                progress:
                  pengajuanTerbaru.target_pendanaan > 0
                    ? (
                        (pengajuanTerbaru.total_pendanaan /
                          pengajuanTerbaru.target_pendanaan) *
                        100
                      ).toFixed(1)
                    : 0,
              }
            : null,
          investor: {
            total: uniqueInvestorIds.length,
          },
          penjualan_chart: Array.isArray(penjualanChart)
            ? penjualanChart.slice(0, 6).reverse()
            : [],
        },
      );
    } catch (error) {
      logger.error("An error occurred while fetching bisnis dashboard", { error });
      return responseHelper.serverError(
        res,
        "An error occurred while fetching bisnis dashboard",
      );
    }
  }
}

module.exports = DashboardController;
