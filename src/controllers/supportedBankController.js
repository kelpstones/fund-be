const SupportedBank = require("../models/supported_banks");
const responseHelper = require("../utils/response");
const { supportedBankValidation, supportedBankUpdateValidation } = require("../validation/supportedBanks");
const logger = require("../utils/index").logger;
const redisClient = require("../utils/index").RedisClient;
const knex = require("../config/db");
const CACHE_KEY_ALL_BANKS = "supported_banks:all";
const CACHE_TTL = 120 * 60;
class SupportedBankController {
  async getActiveBanks(req, res) {
    try {
      let cachedBanks = null;

      try {
        cachedBanks = await redisClient.get(CACHE_KEY_ALL_BANKS);
        if (cachedBanks) {
          logger.info("Cache hit for supported banks", {
            cacheKey: CACHE_KEY_ALL_BANKS,
          });
          return responseHelper.success(
            res,
            "Daftar bank dan e-wallet berhasil diambil (from cache)",
            JSON.parse(cachedBanks),
          );
        } else {
          logger.info("Cache miss for supported banks", {
            cacheKey: CACHE_KEY_ALL_BANKS,
          });
        }
      } catch (error) {
        logger.error("Error accessing Redis cache for supported banks", {
          error,
        });
      }
      const banks = await SupportedBank.getAllActive();
      try {
        await redisClient.setEx(
          CACHE_KEY_ALL_BANKS,
          CACHE_TTL,
          JSON.stringify(banks),
        );
        logger.info("Supported banks saved to Redis cache", {
          cacheKey: CACHE_KEY_ALL_BANKS,
          ttl: CACHE_TTL,
        });
      } catch (error) {
        logger.error("Error accessing Redis cache for supported banks", {
          error,
        });
      }
      return responseHelper.success(res, "Daftar bank dan e-wallet berhasil diambil", banks);
    } catch (error) {
      logger.error("Error in getActiveBanks", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async getBanksForAdmin(req, res) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const result = await SupportedBank.getAll(page, limit, search);
      return responseHelper.withPagination(
        res,
        "Daftar bank berhasil diambil oleh admin",
        result.data,
        {
          page,
          limit,
          totalItems: result.pagination.total,
          search,
        }
      );
    } catch (error) {
      logger.error("Error in getBanksForAdmin", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async createBank(req, res) {
    const trx = await knex.transaction();
    try {
      const { error } = supportedBankValidation(req.body);
      if (error) {
        await trx.rollback();
        return responseHelper.error(res, error.details[0].message, 400);
      }

      const { code } = req.body;
      const exists = await SupportedBank.getByCode(code.toUpperCase(), trx);
      if (exists) {
        await trx.rollback();
        return responseHelper.error(res, "Kode bank/e-wallet sudah terdaftar", 400);
      }

      const bank = await SupportedBank.create(req.body, trx);
      await trx.commit();
      await redisClient.del(CACHE_KEY_ALL_BANKS);
      return responseHelper.created(res, "Bank/e-wallet baru berhasil ditambahkan", bank);
    } catch (error) {
      await trx.rollback();
      logger.error("Error in createBank", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async updateBank(req, res) {
    const trx = await knex.transaction();
    try {
      const { id } = req.params;
      const { error } = supportedBankUpdateValidation(req.body);
      if (error) {
        await trx.rollback();
        return responseHelper.error(res, error.details[0].message, 400);
      }

      const bank = await SupportedBank.getById(id, trx);
      if (!bank) {
        await trx.rollback();
        return responseHelper.error(res, "Bank/e-wallet tidak ditemukan", 404);
      }

      const { code } = req.body;
      if (code && code.toUpperCase() !== bank.code) {
        const exists = await SupportedBank.getByCode(code.toUpperCase(), trx);
        if (exists) {
          await trx.rollback();
          return responseHelper.error(res, "Kode bank/e-wallet sudah digunakan", 400);
        }
      }

      const updated = await SupportedBank.update(id, req.body, trx);
      await trx.commit();
      await redisClient.del(CACHE_KEY_ALL_BANKS);
      return responseHelper.success(res, "Bank/e-wallet berhasil diperbarui", updated);
    } catch (error) {
      await trx.rollback();
      logger.error("Error in updateBank", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async deleteBank(req, res) {
    const trx = await knex.transaction();
    try {
      const { id } = req.params;

      const bank = await SupportedBank.getById(id, trx);
      if (!bank) {
        await trx.rollback();
        return responseHelper.error(res, "Bank/e-wallet tidak ditemukan", 404);
      }

      const inUse = await trx("user_bank_accounts").where({ bank_id: id }).first();
      if (inUse) {
        await trx.rollback();
        return responseHelper.error(
          res,
          "Tidak dapat menghapus bank ini karena masih digunakan oleh rekening pengguna",
          400
        );
      }

      const deleted = await SupportedBank.delete(id, trx);
      if (!deleted) {
        await trx.rollback();
        return responseHelper.error(res, "Gagal menghapus bank/e-wallet", 500);
      }

      await redisClient.del(CACHE_KEY_ALL_BANKS);
      await trx.commit();
      return responseHelper.success(res, "Bank/e-wallet berhasil dihapus");
    } catch (error) {
      await trx.rollback();
      logger.error("Error in deleteBank", { error });
      return responseHelper.serverError(res, error);
    }
  }
}

module.exports = SupportedBankController;
