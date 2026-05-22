const { WalletValidator } = require("../../../src/validation");

describe("WalletValidator.topUpValidation", () => {
  it("lulus dengan jumlah valid (>= 10000)", () => {
    const { error } = WalletValidator.topUpValidation({ jumlah: 10000 });
    expect(error).toBeUndefined();
  });

  it("gagal jika jumlah di bawah 10000", () => {
    const { error } = WalletValidator.topUpValidation({ jumlah: 9000 });
    expect(error).toBeDefined();
  });

  it("gagal jika jumlah negatif", () => {
    const { error } = WalletValidator.topUpValidation({ jumlah: -5000 });
    expect(error).toBeDefined();
  });

  it("gagal jika jumlah kosong", () => {
    const { error } = WalletValidator.topUpValidation({});
    expect(error).toBeDefined();
  });
});

describe("WalletValidator.withdrawValidation", () => {
  it("lulus dengan jumlah valid (>= 50000)", () => {
    const { error } = WalletValidator.withdrawValidation({ jumlah: 50000 });
    expect(error).toBeUndefined();
  });

  it("gagal jika jumlah di bawah 50000", () => {
    const { error } = WalletValidator.withdrawValidation({ jumlah: 49000 });
    expect(error).toBeDefined();
  });

  it("gagal jika jumlah negatif", () => {
    const { error } = WalletValidator.withdrawValidation({ jumlah: -10000 });
    expect(error).toBeDefined();
  });

  it("gagal jika jumlah kosong", () => {
    const { error } = WalletValidator.withdrawValidation({});
    expect(error).toBeDefined();
  });
});
