const request = require("supertest");
const app = require("../../src/app");

const API_KEY = process.env.API_KEY;

describe("POST /api/v1/user/register", () => {
  it("400 jika payload tidak valid (email salah, password tidak cocok)", async () => {
    const res = await request(app)
      .post("/api/v1/user/register")
      .set("x-api-key", API_KEY)
      .send({
        nama: "",
        email: "invalid-email",
        password: "123",
        password_confirmation: "456",
        nik: "short",
        no_telp: "0",
        role_id: 2,
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/user/login", () => {
  it("401 jika kredensial salah", async () => {
    const res = await request(app)
      .post("/api/v1/user/login")
      .set("x-api-key", API_KEY)
      .send({
        email: "tidakada@example.com",
        password: "wrongpassword",
      });
    expect(res.status).toBe(401);
  });

  it("400 jika format email tidak valid", async () => {
    const res = await request(app)
      .post("/api/v1/user/login")
      .set("x-api-key", API_KEY)
      .send({
        email: "bukan-email",
        password: "password123",
      });
    expect(res.status).toBe(400);
  });

  it("400 jika password kosong", async () => {
    const res = await request(app)
      .post("/api/v1/user/login")
      .set("x-api-key", API_KEY)
      .send({
        email: "budi@example.com",
        password: "",
      });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/user/auth-me", () => {
  it("401 tanpa Authorization header", async () => {
    const res = await request(app)
      .get("/api/v1/user/auth-me")
      .set("x-api-key", API_KEY);
    expect(res.status).toBe(401);
  });

  it("401 jika token tidak valid", async () => {
    const res = await request(app)
      .get("/api/v1/user/auth-me")
      .set("x-api-key", API_KEY)
      .set("Authorization", "Bearer token.palsu.ini");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/user/forgot-password", () => {
  it("404 jika email tidak terdaftar", async () => {
    const res = await request(app)
      .post("/api/v1/user/forgot-password")
      .set("x-api-key", API_KEY)
      .send({ email: "tidakterdaftar@example.com" });
    expect(res.status).toBe(404);
  });

  it("400 jika format email tidak valid", async () => {
    const res = await request(app)
      .post("/api/v1/user/forgot-password")
      .set("x-api-key", API_KEY)
      .send({ email: "bukan-email" });
    expect(res.status).toBe(400);
  });
});