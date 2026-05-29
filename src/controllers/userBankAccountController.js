const UserBankAccount = require("../models/user_bank_accounts");
const SupportedBank = require("../models/supported_banks");
const responseHelper = require("../utils/response");
const { bankAccountValidation } = require("../validation/userBankAccounts");
const logger = require("../utils/index").logger;
const knex = require("../config/db");
const axios = require("axios");

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

      const { bank_id, bank_account_number, bank_account_holder } = req.body;
      const bankExists = await SupportedBank.getById(bank_id, trx);
      if (!bankExists) {
        await trx.rollback();
        return responseHelper.error(res, "Bank atau e-wallet tidak didukung", 400);
      }

      let validatedHolderName = bank_account_holder;
      const xenditSecretKey = process.env.XENDIT_SECRET_KEY;
      const isTestEnv = process.env.NODE_ENV === "test";
      const isDummyKey = !xenditSecretKey || xenditSecretKey === "xnd_development_dummy_key" || xenditSecretKey.includes("your_secret_key");

      if (!isTestEnv && !isDummyKey) {
        try {
          const xenditResponse = await axios.post(
            "https://api.xendit.co/bank_accounts/data_lookups",
            {
              bank_code: bankExists.code,
              account_number: bank_account_number,
            },
            {
              auth: {
                username: xenditSecretKey,
                password: "",
              },
              timeout: 10000,
            }
          );
          console.log("Xendit response:", xenditResponse.data);
          if (xenditResponse.data && xenditResponse.data.account_holder_name) {
            validatedHolderName = xenditResponse.data.account_holder_name;
            logger.info("Rekening berhasil divalidasi via Xendit", {
              bank_code: bankExists.code,
              account_number: bank_account_number,
              holder_name: validatedHolderName,
            });
          }
        } catch (xenditError) {
          const status = xenditError.response ? xenditError.response.status : null;
          
          if (status === 404 || status === 403 || status === 401) {
            logger.warn("Verifikasi rekening Xendit dilewati karena layanan belum aktif atau tidak ditemukan (404/403/401). Menggunakan data input manual.", {
              status,
              message: xenditError.message,
            });
            // Gunakan nama manual dari input user
            validatedHolderName = bank_account_holder;
          } else {
            logger.error("Validasi rekening gagal via Xendit", {
              error: xenditError.response ? xenditError.response.data : xenditError.message,
              bank_code: bankExists.code,
              account_number: bank_account_number,
            });
            await trx.rollback();

            const errorMsg = xenditError.response && xenditError.response.data && xenditError.response.data.message
              ? xenditError.response.data.message
              : "Nomor rekening tidak valid atau tidak dapat diverifikasi oleh bank terkait";

            return responseHelper.error(res, errorMsg, 400);
          }
        }
      } else {
        logger.info("Verifikasi rekening Xendit dilewati (lingkungan test/dummy key)", {
          env: process.env.NODE_ENV,
          hasKey: !!xenditSecretKey,
        });
      }

      // Gunakan nama tervalidasi dari bank
      req.body.bank_account_holder = validatedHolderName;

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
