const { NegotiationValidator } = require("../../../src/validation");

const VALID_NEGOTIATION = {
  pengajuans_id: 1,
  penawaran_return: 12.5,
  penawaran_nominal: 50_000_000,
  catatan: "Penawaran awal saya",
};

describe("NegotiationValidator.negotiationValidation", () => {
  it("lulus dengan payload valid", () => {
    const { error } = NegotiationValidator.negotiationValidation(VALID_NEGOTIATION);
    expect(error).toBeUndefined();
  });

  it("gagal jika pengajuans_id tidak ada", () => {
    const { pengajuans_id, ...rest } = VALID_NEGOTIATION;
    const { error } = NegotiationValidator.negotiationValidation(rest);
    expect(error).toBeDefined();
  });

  it("gagal jika penawaran_return tidak ada", () => {
    const { error } = NegotiationValidator.negotiationValidation({
      ...VALID_NEGOTIATION,
      penawaran_return: undefined,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika penawaran_nominal adalah 0", () => {
    const { error } = NegotiationValidator.negotiationValidation({
      ...VALID_NEGOTIATION,
      penawaran_nominal: 0,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika penawaran_nominal negatif", () => {
    const { error } = NegotiationValidator.negotiationValidation({
      ...VALID_NEGOTIATION,
      penawaran_nominal: -1000,
    });
    expect(error).toBeDefined();
  });
});

describe("NegotiationValidator.replyNegotiationValidation", () => {
  const VALID_REPLY = {
    penawaran_return: 10,
    penawaran_nominal: 25_000_000,
    catatan: "Counter offer saya",
  };

  it("lulus dengan payload reply valid", () => {
    const { error } = NegotiationValidator.replyNegotiationValidation(VALID_REPLY);
    expect(error).toBeUndefined();
  });

  it("gagal jika penawaran_return tidak ada", () => {
    const { error } = NegotiationValidator.replyNegotiationValidation({
      ...VALID_REPLY,
      penawaran_return: undefined,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika penawaran_nominal tidak ada", () => {
    const { error } = NegotiationValidator.replyNegotiationValidation({
      ...VALID_REPLY,
      penawaran_nominal: undefined,
    });
    expect(error).toBeDefined();
  });
});

describe("NegotiationValidator.acceptRejectNegotiationValidation", () => {
  it("lulus dengan catatan valid", () => {
    const { error } = NegotiationValidator.acceptRejectNegotiationValidation({ catatan: "Setuju" });
    expect(error).toBeUndefined();
  });

  it("gagal jika catatan kosong", () => {
    const { error } = NegotiationValidator.acceptRejectNegotiationValidation({ catatan: "" });
    expect(error).toBeDefined();
  });
});
