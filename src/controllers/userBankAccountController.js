const UserBankAccount = require("../models/user_bank_accounts");
const SupportedBank = require("../models/supported_banks");
const responseHelper = require("../utils/response");
const { bankAccountValidation } = require("../validation/userBankAccounts");
const logger = require("../utils/index").logger;
const knex = require("../config/db");

class UserBankAccountController {
  async addBankAccount(req, res) {
    const trx = await knex.transaction();
    try {
      const { id: user_id } = req.user;
      const { error } = bankAccountValidation(req.body);
      if (error) {
        await trx.rollback();
        return responseHelper.error(res, error.details[0].message, 400);
      }

      const { bank_id } = req.body;
      const bankExists = await SupportedBank.getById(bank_id, trx);
      if (!bankExists) {
        await trx.rollback();
        return responseHelper.error(res, "Bank atau e-wallet tidak didukung", 400);
      }

      const account = await UserBankAccount.create(user_id, req.body, trx);
      await trx.commit();

      return responseHelper.created(res, "Rekening bank berhasil ditambahkan", account);
    } catch (error) {
      await trx.rollback();
      logger.error("Error in addBankAccount", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async getBankAccounts(req, res) {
    try {
      const { id: user_id } = req.user;
      const accounts = await UserBankAccount.getByUserId(user_id);
      return responseHelper.success(res, "Rekening bank berhasil diambil", accounts);
    } catch (error) {
      logger.error("Error in getBankAccounts", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async deleteBankAccount(req, res) {
    const trx = await knex.transaction();
    try {
      const { id: user_id } = req.user;
      const { id } = req.params;

      const success = await UserBankAccount.delete(Number(id), user_id, trx);
      if (!success) {
        await trx.rollback();
        return responseHelper.error(res, "Rekening bank tidak ditemukan", 404);
      }

      await trx.commit();
      return responseHelper.success(res, "Rekening bank berhasil dihapus");
    } catch (error) {
      await trx.rollback();
      logger.error("Error in deleteBankAccount", { error });
      return responseHelper.serverError(res, error);
    }
  }

  async setPrimaryBankAccount(req, res) {
    const trx = await knex.transaction();
    try {
      const { id: user_id } = req.user;
      const { id } = req.params;

      const success = await UserBankAccount.setPrimary(Number(id), user_id, trx);
      if (!success) {
        await trx.rollback();
        return responseHelper.error(res, "Rekening bank tidak ditemukan", 404);
      }

      await trx.commit();
      return responseHelper.success(res, "Rekening bank utama berhasil diatur");
    } catch (error) {
      await trx.rollback();
      logger.error("Error in setPrimaryBankAccount", { error });
      return responseHelper.serverError(res, error);
    }
  }
}

module.exports = UserBankAccountController;
