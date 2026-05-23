const BaseModel = require("./base");

class UserBankAccount extends BaseModel {
  constructor() {
    super("user_bank_accounts");
  }

  async create(userId, data, trx = this.knex) {
    try {
      const existing = await trx(this.tableName)
        .where({ user_id: userId })
        .first();

      const isPrimary = !existing;

      const [inserted] = await trx(this.tableName)
        .insert({
          user_id: userId,
          bank_id: data.bank_id,
          bank_account_number: data.bank_account_number,
          bank_account_holder: data.bank_account_holder,
          is_primary: isPrimary || !!data.is_primary,
        })
        .returning("*");

      if (isPrimary || data.is_primary) {
        await this.setPrimary(inserted.id, userId, trx);
      }

      return await this.getById(inserted.id, trx);
    } catch (error) {
      throw error;
    }
  }

  async getByUserId(userId, trx = this.knex) {
    try {
      return await trx(this.tableName)
        .select(
          "user_bank_accounts.*",
          "supported_banks.name as bank_name",
          "supported_banks.code as bank_code",
          "supported_banks.type as bank_type",
          "supported_banks.logo_url as bank_logo_url"
        )
        .leftJoin("supported_banks", "user_bank_accounts.bank_id", "supported_banks.id")
        .where({ "user_bank_accounts.user_id": userId })
        .orderBy("user_bank_accounts.created_at", "desc");
    } catch (error) {
      throw error;
    }
  }

  async getById(id, trx = this.knex) {
    try {
      return await trx(this.tableName)
        .select(
          "user_bank_accounts.*",
          "supported_banks.name as bank_name",
          "supported_banks.code as bank_code",
          "supported_banks.type as bank_type",
          "supported_banks.logo_url as bank_logo_url"
        )
        .leftJoin("supported_banks", "user_bank_accounts.bank_id", "supported_banks.id")
        .where({ "user_bank_accounts.id": id })
        .first();
    } catch (error) {
      throw error;
    }
  }

  async delete(id, userId, trx = this.knex) {
    try {
      const account = await trx(this.tableName)
        .where({ id, user_id: userId })
        .first();

      if (!account) return false;

      await trx(this.tableName).where({ id, user_id: userId }).del();

      if (account.is_primary) {
        const nextAccount = await trx(this.tableName)
          .where({ user_id: userId })
          .first();

        if (nextAccount) {
          await trx(this.tableName)
            .where({ id: nextAccount.id })
            .update({ is_primary: true });
        }
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async setPrimary(id, userId, trx = this.knex) {
    try {
      const account = await trx(this.tableName)
        .where({ id, user_id: userId })
        .first();

      if (!account) return false;

      await trx(this.tableName)
        .where({ user_id: userId })
        .update({ is_primary: false });

      await trx(this.tableName)
        .where({ id, user_id: userId })
        .update({ is_primary: true });

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserBankAccount();
