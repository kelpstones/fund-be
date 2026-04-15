class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.knex = require("../config/db");
  }
}

module.exports = BaseModel;
