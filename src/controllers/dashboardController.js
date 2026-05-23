const responseHelper = require("../utils/index").ResponseHelper;
const Bisnis = require("../models/bisnis");
const Pengajuan = require("../models/pengajuans");
const DistribusiProfit = require("../models/distribusi_profits");
const Penjualan = require("../models/penjualans");
const logger = require("../utils/index").logger;
const knex = require("../config/db");

class DashboardController {
  async getAdminDashboard(req, res) {
    try {
      const [
        bisnisCountResult,
        usersCountResult,
        pengajuanCountResult,
        pengajuanStatusResult,
        investasiSumResult,
        profitStatusResult,
        recentPengajuan,
      ] = await Promise.all([
        knex("bisnis").count("id as total").first(),
        knex("users").count("id as total").first(),
        knex("pengajuans").count("id as total").first(),
        knex("pengajuans")
          .select("status")
          .count("id as total")
          .groupBy("status"),
        knex("investasis").sum("nominal_investasi as total").first(),
        knex("distribusi_profits")
          .select("status")
          .count("id as jumlah")
          .sum("nominal_profit as total_nominal")
          .groupBy("status"),
        Pengajuan.getAllPengajuans(1, 5),
      ]);

      const totalBisnis = parseInt(bisnisCountResult?.total || 0, 10);
      const totalUsers = parseInt(usersCountResult?.total || 0, 10);
      const totalPengajuan = parseInt(pengajuanCountResult?.total || 0, 10);

      const pengajuanByStatus = pengajuanStatusResult.reduce((acc, row) => {
        acc[row.status] = parseInt(row.total || 0, 10);
        return acc;
      }, {});

      const totalNominalInvestasi = parseFloat(investasiSumResult?.total || 0);

      const distribusiByStatus = profitStatusResult.reduce((acc, row) => {
        acc[row.status] = {
          jumlah: parseInt(row.jumlah || 0, 10),
          total_nominal: parseFloat(row.total_nominal || 0),
        };
        return acc;
      }, {});

      return responseHelper.success(
        res,
        "Admin dashboard fetched successfully",
        {
          bisnis: {
            total: totalBisnis,
          },
          users: {
            total: totalUsers,
          },
          pengajuan: {
            total: totalPengajuan,
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
      const [
        investasiSumResult,
        investasiCountResult,
        profitStatusResult,
        recentDistribusi,
      ] = await Promise.all([
        knex("investasis")
          .where({ investor_id })
          .sum("nominal_investasi as total")
          .first(),
        knex("investasis")
          .where({ investor_id })
          .count("id as total")
          .first(),
        knex("distribusi_profits")
          .where({ investor_id })
          .select("status")
          .count("id as jumlah")
          .sum("nominal_profit as total_nominal")
          .groupBy("status"),
        DistribusiProfit.getByInvestorId(investor_id, 1, 5),
      ]);

      const totalNominalInvestasi = parseFloat(investasiSumResult?.total || 0);
      const jumlahAktif = parseInt(investasiCountResult?.total || 0, 10);

      const distribusiByStatus = profitStatusResult.reduce((acc, row) => {
        acc[row.status] = {
          jumlah: parseInt(row.jumlah || 0, 10),
          total_nominal: parseFloat(row.total_nominal || 0),
        };
        return acc;
      }, {});

      return responseHelper.success(
        res,
        "Investor dashboard fetched successfully",
        {
          investasi: {
            total_nominal: totalNominalInvestasi,
            jumlah_aktif: jumlahAktif,
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

      const [pengajuanResult, investorCountResult] = await Promise.all([
        Pengajuan.getPengajuanByBisnisId(bisnis.id),
        knex("investasis")
          .join("pengajuans", "investasis.pengajuans_id", "pengajuans.id")
          .join("bisnis", "pengajuans.bisnis_id", "bisnis.id")
          .where("bisnis.user_id", user_id)
          .countDistinct("investasis.investor_id as total")
          .first(),
      ]);

      const pengajuanTerbaru = Array.isArray(pengajuanResult)
        ? pengajuanResult[0]
        : pengajuanResult;

      const penjualanChart = pengajuanTerbaru
        ? await Penjualan.getPenjualanByPengajuanId(pengajuanTerbaru.id)
        : [];

      const totalInvestors = parseInt(investorCountResult?.total || 0, 10);

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
            total: totalInvestors,
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
