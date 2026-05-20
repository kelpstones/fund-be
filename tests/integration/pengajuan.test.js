const request = require("supertest");
const app = require("../../src/app");

describe("GET /api/v1/pengajuan (getAllPengajuan)", () => {
  it("200 atau 401 — endpoint publik biasanya butuh key/auth", async () => {
    const res = await request(app).get("/api/v1/pengajuan");
    expect([200, 401, 403]).toContain(res.status);
  });
});

describe("POST /api/v1/pengajuan (createPengajuan)", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).post("/api/v1/pengajuan").send({
      bisnis_id: 1,
      target_pendanaan: 100_000_000,
      per_anual_return: 15,
    });
    expect(res.status).toBe(401);
  });

  it("401 dengan token palsu", async () => {
    const res = await request(app)
      .post("/api/v1/pengajuan")
      .set("Authorization", "Bearer token.palsu")
      .send({
        bisnis_id: 1,
        target_pendanaan: 100_000_000,
        per_anual_return: 15,
      });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/pengajuan/:id", () => {
  it("401 atau 404 untuk ID yang tidak ada tanpa auth", async () => {
    const res = await request(app).get("/api/v1/pengajuan/999999");
    expect([401, 403, 404]).toContain(res.status);
  });
});

describe("PUT /api/v1/pengajuan/:id (updatePengajuan)", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).put("/api/v1/pengajuan/1").send({ target_pendanaan: 200_000_000 });
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/v1/pengajuan/:id", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).delete("/api/v1/pengajuan/1");
    expect(res.status).toBe(401);
  });
});
