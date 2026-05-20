const { PenjualanValidator } = require("../../../src/validation");

const VALID_PENJUALAN = {
  pengajuans_id: 1,
  periode: "2024-Q1",
  total_penjualan: 50_000_000,
  laba_bersih: 10_000_000,
  laba_kotor: 15_000_000,
  jumlah_transaksi: 200,
};

describe("PenjualanValidator.penjualanValidation", () => {
  it("lulus dengan payload valid", () => {
    const { error } = PenjualanValidator.penjualanValidation(VALID_PENJUALAN);
    expect(error).toBeUndefined();
  });

  it("gagal jika pengajuans_id tidak ada", () => {
    const { pengajuans_id, ...rest } = VALID_PENJUALAN;
    const { error } = PenjualanValidator.penjualanValidation(rest);
    expect(error).toBeDefined();
  });

  it("gagal jika periode tidak ada", () => {
    const { error } = PenjualanValidator.penjualanValidation({ ...VALID_PENJUALAN, periode: undefined });
    expect(error).toBeDefined();
  });

  it("gagal jika total_penjualan tidak ada", () => {
    const { error } = PenjualanValidator.penjualanValidation({ ...VALID_PENJUALAN, total_penjualan: undefined });
    expect(error).toBeDefined();
  });

  it("gagal jika jumlah_transaksi bukan integer", () => {
    const { error } = PenjualanValidator.penjualanValidation({ ...VALID_PENJUALAN, jumlah_transaksi: 1.5 });
    expect(error).toBeDefined();
  });
});

describe("PenjualanValidator.penjualanUpdateValidation", () => {
  it("lulus dengan partial update valid", () => {
    const { error } = PenjualanValidator.penjualanUpdateValidation({ total_penjualan: 60_000_000 });
    expect(error).toBeUndefined();
  });

  it("lulus tanpa field apapun (semua opsional)", () => {
    const { error } = PenjualanValidator.penjualanUpdateValidation({});
    expect(error).toBeUndefined();
  });
});
