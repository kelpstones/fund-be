const { PreferensiInvestorValidator } = require("../../../src/validation");

const VALID_PREFERENSI = {
  kepuasan_pelanggan: 4,
  digital_adoption_score: 7,
  net_profit_margin: 25,
  year_revenue: 500_000_000,
  business_tenure_years: 3,
};

describe("PreferensiInvestorValidator.preferensiInvestorValidation", () => {
  it("lulus dengan payload valid", () => {
    const { error } = PreferensiInvestorValidator.preferensiInvestorValidation(VALID_PREFERENSI);
    expect(error).toBeUndefined();
  });

  it("gagal jika kepuasan_pelanggan di atas 5", () => {
    const { error } = PreferensiInvestorValidator.preferensiInvestorValidation({
      ...VALID_PREFERENSI,
      kepuasan_pelanggan: 6,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika kepuasan_pelanggan di bawah 1", () => {
    const { error } = PreferensiInvestorValidator.preferensiInvestorValidation({
      ...VALID_PREFERENSI,
      kepuasan_pelanggan: 0,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika digital_adoption_score di atas 10", () => {
    const { error } = PreferensiInvestorValidator.preferensiInvestorValidation({
      ...VALID_PREFERENSI,
      digital_adoption_score: 11,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika year_revenue di bawah minimum (18 juta)", () => {
    const { error } = PreferensiInvestorValidator.preferensiInvestorValidation({
      ...VALID_PREFERENSI,
      year_revenue: 1_000_000,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika year_revenue di atas maksimum (50 miliar)", () => {
    const { error } = PreferensiInvestorValidator.preferensiInvestorValidation({
      ...VALID_PREFERENSI,
      year_revenue: 100_000_000_000,
    });
    expect(error).toBeDefined();
  });

  it("lulus jika net_profit_margin negatif tapi di atas -35", () => {
    const { error } = PreferensiInvestorValidator.preferensiInvestorValidation({
      ...VALID_PREFERENSI,
      net_profit_margin: -20,
    });
    expect(error).toBeUndefined();
  });

  it("gagal jika net_profit_margin di bawah -35", () => {
    const { error } = PreferensiInvestorValidator.preferensiInvestorValidation({
      ...VALID_PREFERENSI,
      net_profit_margin: -40,
    });
    expect(error).toBeDefined();
  });
});
