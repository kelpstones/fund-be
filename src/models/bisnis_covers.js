const BaseModel = require('./base')

class BisnisCover extends BaseModel {
  constructor() {
    super('bisnis_cover')
  }

  #formatResponse(row) {
    if (!row) return null
    return {
      id: row.id,
      bisnis_id: row.bisnis_id,
      image_url: row.image_url,
      urutan: row.urutan,
      created_at: row.created_at,
    }
  }

  async getByBisnisId(bisnis_id) {
    try {
      const rows = await this.knex(this.tableName)
        .where({ bisnis_id })
        .orderBy('urutan', 'asc')
      return rows.map(row => this.#formatResponse(row))
    } catch (error) {
      throw error
    }
  }

  async getById(id) {
    try {
      const row = await this.knex(this.tableName).where({ id }).first()
      return this.#formatResponse(row)
    } catch (error) {
      throw error
    }
  }

  async countByBisnisId(bisnis_id) {
    try {
      const [{ count }] = await this.knex(this.tableName)
        .where({ bisnis_id })
        .count('id as count')
      return parseInt(count)
    } catch (error) {
      throw error
    }
  }

  async insert(bisnis_id, image_url, urutan) {
    try {
      const [row] = await this.knex(this.tableName)
        .insert({ bisnis_id, image_url, urutan })
        .returning('*')
      return this.#formatResponse(row)
    } catch (error) {
      throw error
    }
  }

  async delete(id) {
    try {
      await this.knex(this.tableName).where({ id }).del()
    } catch (error) {
      throw error
    }
  }

  async reorder(bisnis_id, orders) {
    // orders = [{ id: 1, urutan: 0 }, { id: 2, urutan: 1 }]
    try {
      await Promise.all(
        orders.map(({ id, urutan }) =>
          this.knex(this.tableName).where({ id, bisnis_id }).update({ urutan })
        )
      )
    } catch (error) {
      throw error
    }
  }
}

module.exports = new BisnisCover()