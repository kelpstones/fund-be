const {
  mapQuestionnaireToMetrics,
  mapSektorToTipeUsaha,
  TARGET_DEFAULTS
} = require("../../../src/utils/preferenceMapper");

describe("preferenceMapper utility tests", () => {
  describe("mapQuestionnaireToMetrics", () => {
    it("should return defaults when request body is empty", () => {
      const metrics = mapQuestionnaireToMetrics({});
      
      expect(metrics.kepuasan_pelanggan).toBeGreaterThanOrEqual(TARGET_DEFAULTS.kepuasan_pelanggan.min);
      expect(metrics.kepuasan_pelanggan).toBeLessThanOrEqual(TARGET_DEFAULTS.kepuasan_pelanggan.max);
      
      expect(metrics.digital_adoption_score).toBeGreaterThanOrEqual(TARGET_DEFAULTS.digital_adoption_score.min);
      expect(metrics.digital_adoption_score).toBeLessThanOrEqual(TARGET_DEFAULTS.digital_adoption_score.max);

      expect(metrics.net_profit_margin).toBeGreaterThanOrEqual(TARGET_DEFAULTS.net_profit_margin.min);
      expect(metrics.net_profit_margin).toBeLessThanOrEqual(TARGET_DEFAULTS.net_profit_margin.max);

      expect(metrics.year_revenue).toBeGreaterThanOrEqual(TARGET_DEFAULTS.year_revenue.min);
      expect(metrics.year_revenue).toBeLessThanOrEqual(TARGET_DEFAULTS.year_revenue.max);

      expect(metrics.business_tenure_years).toBeGreaterThanOrEqual(TARGET_DEFAULTS.business_tenure_years.min);
      expect(metrics.business_tenure_years).toBeLessThanOrEqual(TARGET_DEFAULTS.business_tenure_years.max);
    });

    it("should successfully map valid questionnaire short keys to valid metrics ranges", () => {
      const payload = {
        tujuan_investasi: "pendapatan_stabil",
        risk_tolerance: "aman_stabil",
        tipe_umkm: "stabil",
        cara_memilih: "risiko"
      };

      const metrics = mapQuestionnaireToMetrics(payload);

      // net_profit_margin ranges from:
      // pendapatan_stabil: [10, 25]
      // aman_stabil: [5, 20]
      // risk (risiko) option doesn't affect profit margin.
      // Average min = (10 + 5)/2 = 7.5
      // Average max = (25 + 20)/2 = 22.5
      expect(metrics.net_profit_margin).toBeGreaterThanOrEqual(7.5);
      expect(metrics.net_profit_margin).toBeLessThanOrEqual(22.5);

      // business_tenure_years ranges from:
      // pendapatan_stabil: [4, 15]
      // aman_stabil: [5, 20]
      // tipe_umkm (stabil): [5, 30]
      // cara_memilih (risiko): [4, 15]
      // Average min = (4+5+5+4)/4 = 4.5
      // Average max = (15+20+30+15)/4 = 20
      expect(metrics.business_tenure_years).toBeGreaterThanOrEqual(4.5);
      expect(metrics.business_tenure_years).toBeLessThanOrEqual(20);
    });

    it("should be case and formatting tolerant for questionnaire values", () => {
      const payload = {
        tujuan_investasi: "Pendapatan Stabil",
        risk_tolerance: "aman-dan-stabil",
        tipe_umkm: "sudah berjalan stabil",
        cara_memilih: "Risiko Lebih Rendah"
      };

      const metrics = mapQuestionnaireToMetrics(payload);
      
      expect(metrics.net_profit_margin).toBeGreaterThanOrEqual(7.5);
      expect(metrics.net_profit_margin).toBeLessThanOrEqual(22.5);
      expect(metrics.business_tenure_years).toBeGreaterThanOrEqual(4.5);
      expect(metrics.business_tenure_years).toBeLessThanOrEqual(20);
    });
  });

  describe("mapSektorToTipeUsaha", () => {
    it("should return empty array when sector query is missing or empty", () => {
      expect(mapSektorToTipeUsaha(undefined)).toEqual([]);
      expect(mapSektorToTipeUsaha("")).toEqual([]);
      expect(mapSektorToTipeUsaha([])).toEqual([]);
    });

    it("should map single sector strings correctly", () => {
      expect(mapSektorToTipeUsaha("kuliner")).toEqual(["kuliner"]);
      expect(mapSektorToTipeUsaha("fashion")).toEqual(["fashion"]);
      expect(mapSektorToTipeUsaha("agribisnis")).toEqual(["pertanian"]);
      expect(mapSektorToTipeUsaha("pertanian")).toEqual(["pertanian"]);
    });

    it("should map complex sector combinations and normalize text formatting", () => {
      expect(mapSektorToTipeUsaha("jasa/teknologi")).toEqual(["jasa", "teknologi"]);
      expect(mapSektorToTipeUsaha("Jasa Teknologi")).toEqual(["jasa", "teknologi"]);
      expect(mapSektorToTipeUsaha("jasa_teknologi")).toEqual(["jasa", "teknologi"]);
    });

    it("should map array inputs and handle multiple items", () => {
      const input = ["Kuliner", "agribisnis", "Fashion"];
      const result = mapSektorToTipeUsaha(input);
      expect(result).toContain("kuliner");
      expect(result).toContain("pertanian");
      expect(result).toContain("fashion");
      expect(result.length).toBe(3);
    });

    it("should parse comma separated query strings correctly", () => {
      const input = "kuliner, fashion, agribisnis, Jasa/Teknologi";
      const result = mapSektorToTipeUsaha(input);
      expect(result).toContain("kuliner");
      expect(result).toContain("fashion");
      expect(result).toContain("pertanian");
      expect(result).toContain("jasa");
      expect(result).toContain("teknologi");
      expect(result.length).toBe(5);
    });

    it("should return empty array if bebas is selected", () => {
      expect(mapSektorToTipeUsaha("bebas")).toEqual([]);
      expect(mapSektorToTipeUsaha(["kuliner", "bebas"])).toEqual([]);
      expect(mapSektorToTipeUsaha("kuliner, bebas, fashion")).toEqual([]);
    });
  });
});
