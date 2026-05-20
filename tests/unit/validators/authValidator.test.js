const { AuthValidator, PasswordResetValidator } = require("../../../src/validation");

const VALID_REGISTER = {
  nama: "Budi Santoso",
  email: "budi@example.com",
  password: "Rahasia123!",
  password_confirmation: "Rahasia123!",
  nik: "3201010101010001",
  no_telp: "081234567890",
  role_id: 2,
};

describe("AuthValidator.registerValidation", () => {
  it("lulus dengan payload valid", () => {
    const result = AuthValidator.registerValidation(VALID_REGISTER);
    expect(result.status).toBe(true);
  });

  it("gagal jika email kosong", () => {
    const result = AuthValidator.registerValidation({ ...VALID_REGISTER, email: "" });
    expect(result.status).toBe(false);
  });

  it("gagal jika format email tidak valid", () => {
    const result = AuthValidator.registerValidation({ ...VALID_REGISTER, email: "bukan-email" });
    expect(result.status).toBe(false);
  });

  it("gagal jika password dan konfirmasi tidak sama", () => {
    const result = AuthValidator.registerValidation({
      ...VALID_REGISTER,
      password_confirmation: "BedaBeda123!",
    });
    expect(result.status).toBe(false);
  });

  it("gagal jika NIK kurang dari 16 digit", () => {
    const result = AuthValidator.registerValidation({ ...VALID_REGISTER, nik: "12345" });
    expect(result.status).toBe(false);
  });

  it("gagal jika role_id tidak diisi", () => {
    const { role_id, ...rest } = VALID_REGISTER;
    const result = AuthValidator.registerValidation(rest);
    expect(result.status).toBe(false);
  });
});

describe("AuthValidator.loginValidation", () => {
  it("lulus dengan email dan password valid", () => {
    const result = AuthValidator.loginValidation({ email: "budi@example.com", password: "Rahasia123!" });
    expect(result.status).toBe(true);
  });

  it("gagal jika email tidak valid", () => {
    const result = AuthValidator.loginValidation({ email: "bukan-email", password: "Rahasia123!" });
    expect(result.status).toBe(false);
  });

  it("gagal jika password kosong", () => {
    const result = AuthValidator.loginValidation({ email: "budi@example.com", password: "" });
    expect(result.status).toBe(false);
  });

  it("gagal jika kedua field kosong", () => {
    const result = AuthValidator.loginValidation({ email: "", password: "" });
    expect(result.status).toBe(false);
  });
});

describe("PasswordResetValidator.requestPasswordResetValidation", () => {
  it("lulus dengan email valid", () => {
    const result = PasswordResetValidator.requestPasswordResetValidation({ email: "budi@example.com" });
    expect(result.status).toBe(true);
  });

  it("gagal jika email tidak valid", () => {
    const result = PasswordResetValidator.requestPasswordResetValidation({ email: "tidakvalid" });
    expect(result.status).toBe(false);
  });
});

describe("PasswordResetValidator.resetPasswordValidation", () => {
  const VALID_RESET = {
    token: "validtoken123abc",
    new_password: "NewPass123!",
    password_confirmation: "NewPass123!",
  };

  it("lulus dengan payload valid", () => {
    const result = PasswordResetValidator.resetPasswordValidation(VALID_RESET);
    expect(result.status).toBe(true);
  });

  it("gagal jika password baru dan konfirmasi tidak cocok", () => {
    const result = PasswordResetValidator.resetPasswordValidation({
      ...VALID_RESET,
      password_confirmation: "BedaBeda!",
    });
    expect(result.status).toBe(false);
  });

  it("gagal jika token kosong", () => {
    const result = PasswordResetValidator.resetPasswordValidation({
      ...VALID_RESET,
      token: "",
    });
    expect(result.status).toBe(false);
  });
});
