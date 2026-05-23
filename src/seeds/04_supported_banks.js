exports.seed = async function (knex) {
  const existing = await knex("supported_banks").count("id as count").first();
  if (parseInt(existing.count) > 0) return;

  await knex("supported_banks").insert([
    { code: "BCA", name: "Bank Central Asia", type: "bank", is_active: true },
    { code: "MANDIRI", name: "Bank Mandiri", type: "bank", is_active: true },
    { code: "BNI", name: "Bank Negara Indonesia", type: "bank", is_active: true },
    { code: "BRI", name: "Bank Rakyat Indonesia", type: "bank", is_active: true },
    { code: "BSI", name: "Bank Syariah Indonesia", type: "bank", is_active: true },
    { code: "CIMB", name: "Bank CIMB Niaga", type: "bank", is_active: true },
    { code: "PERMATA", name: "Bank Permata", type: "bank", is_active: true },
    { code: "GOPAY", name: "GoPay", type: "ewallet", is_active: true },
    { code: "OVO", name: "OVO", type: "ewallet", is_active: true },
    { code: "DANA", name: "DANA", type: "ewallet", is_active: true },
    { code: "LINKAJA", name: "LinkAja", type: "ewallet", is_active: true },
    { code: "SHOPEEPAY", name: "ShopeePay", type: "ewallet", is_active: true }
  ]);
};
