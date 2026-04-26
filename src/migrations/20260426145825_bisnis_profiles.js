exports.up = function (knex) {
  return knex.schema.createTable("bisnis_profiles", (t) => {
    t.increments("id").primary();
    t.integer("bisnis_id")
      .references("id")
      .inTable("bisnis")
      .onDelete("CASCADE");

    // Input user
    t.decimal("net_profit_margin", 8, 2); // dalam persen, bisa negatif
    t.decimal("kepuasan_pelanggan", 4, 1); // 1.0 - 5.0
    t.enum("peak_hour_latency", ["low", "medium", "high"]).defaultTo("medium");
    t.decimal("review_volatility", 8, 2);
    t.decimal("repeat_order_rate", 8, 2);
    t.integer("digital_adoption_score"); // 1 - 10
    t.decimal("year_revenue", 15, 2); // total revenue per tahun
    t.decimal("business_tenure_years", 5, 2); // lama bisnis berjalan (tahun)

    t.integer("class").defaultTo(0).nullable(); // 0: Critical, 1: Struggling, 2: Growth, 3: Elite

    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("bisnis_profiles");
};
