const { BisnisValidator } = require("../../../src/validation");

const VALID_BISNIS = {
  nama: "Warung Makan Budi",
  tipe_usaha: "kuliner",
  alamat: "Jl. Merdeka No. 1, Depok",
  no_telp: "081234567890",
  email: "warung@example.com",
  deskripsi: "Warung makan dengan menu nusantara",
  user_id: 1,
  kelas_id: 2,
};

describe("BisnisValidator.bisnisValidation", () => {
  it("lulus dengan payload valid", () => {
    const { error } = BisnisValidator.bisnisValidation(VALID_BISNIS);
    expect(error).toBeUndefined();
  });

  it("lulus tanpa no_telp (opsional)", () => {
    const { no_telp, ...rest } = VALID_BISNIS;
    const { error } = BisnisValidator.bisnisValidation(rest);
    expect(error).toBeUndefined();
  });

  it("gagal jika nama tidak diisi", () => {
    const { error } = BisnisValidator.bisnisValidation({ ...VALID_BISNIS, nama: "" });
    expect(error).toBeDefined();
  });

  it("gagal jika tipe_usaha tidak valid", () => {
    const { error } = BisnisValidator.bisnisValidation({ ...VALID_BISNIS, tipe_usaha: "otomotif" });
    expect(error).toBeDefined();
  });

  it("gagal jika email tidak valid", () => {
    const { error } = BisnisValidator.bisnisValidation({ ...VALID_BISNIS, email: "bukan-email" });
    expect(error).toBeDefined();
  });

  it("gagal jika user_id tidak ada", () => {
    const { user_id, ...rest } = VALID_BISNIS;
    const { error } = BisnisValidator.bisnisValidation(rest);
    expect(error).toBeDefined();
  });
});

describe("BisnisValidator.bisnisUpdateValidation", () => {
  it("lulus dengan partial update valid", () => {
    const { error } = BisnisValidator.bisnisUpdateValidation({ nama: "Nama Baru" });
    expect(error).toBeUndefined();
  });

  it("lulus dengan update tipe_usaha valid", () => {
    const { error } = BisnisValidator.bisnisUpdateValidation({ tipe_usaha: "teknologi" });
    expect(error).toBeUndefined();
  });

  it("gagal jika tipe_usaha tidak valid", () => {
    const { error } = BisnisValidator.bisnisUpdateValidation({ tipe_usaha: "invalid" });
    expect(error).toBeDefined();
  });

  it("gagal jika email update tidak valid", () => {
    const { error } = BisnisValidator.bisnisUpdateValidation({ email: "tidakvalid" });
    expect(error).toBeDefined();
  });
});
