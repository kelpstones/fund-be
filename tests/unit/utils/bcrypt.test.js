const { hashPassword, comparePassword } = require("../../../src/utils/Bcrypt");

describe("hashPassword", () => {
  it("menghasilkan hash yang berbeda dari plaintext", async () => {
    const hash = await hashPassword("RahasiaSaya123!");
    expect(hash).not.toBe("RahasiaSaya123!");
  });

  it("menghasilkan hash dengan panjang yang wajar (bcrypt = 60 karakter)", async () => {
    const hash = await hashPassword("password");
    expect(hash.length).toBe(60);
  });

  it("dua hash dari password sama harus berbeda (salt unik)", async () => {
    const hash1 = await hashPassword("samPassword");
    const hash2 = await hashPassword("samPassword");
    expect(hash1).not.toBe(hash2);
  });
});

describe("comparePassword", () => {
  it("mengembalikan true jika password cocok", async () => {
    const hash = await hashPassword("passwordAsli");
    const isMatch = await comparePassword("passwordAsli", hash);
    expect(isMatch).toBe(true);
  });

  it("mengembalikan false jika password salah", async () => {
    const hash = await hashPassword("passwordAsli");
    const isMatch = await comparePassword("passwordSalah", hash);
    expect(isMatch).toBe(false);
  });

  it("mengembalikan false jika password kosong", async () => {
    const hash = await hashPassword("passwordAsli");
    const isMatch = await comparePassword("", hash);
    expect(isMatch).toBe(false);
  });
});
