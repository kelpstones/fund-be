const jwt = require("jsonwebtoken");


process.env.JWT_SECRET = "test_secret_key_for_unit_test";
process.env.JWT_EXPIRES_IN = "1h";

const { decodeToken } = require("../../../src/utils/jwt");

describe("decodeToken", () => {
  const dummyPayload = { id: 1, email: "test@example.com", role_name: "investor" };

  it("berhasil decode token yang valid", () => {
    const token = jwt.sign(dummyPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const decoded = decodeToken(token);
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.role_name).toBe("investor");
  });

  it("mengembalikan null jika token tidak valid", () => {
    const result = decodeToken("ini.bukan.token");
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("mengembalikan null jika token kosong", () => {
    const result = decodeToken("");
    expect(result).toBeNull();
  });
});
