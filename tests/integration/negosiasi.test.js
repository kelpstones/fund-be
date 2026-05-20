const request = require("supertest");
const app = require("../../src/app");

// Semua endpoint negosiasi butuh auth — test fokus pada guard layer
describe("POST /api/v1/negosiasi (startNegotiation)", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).post("/api/v1/negosiasi").send({
      pengajuans_id: 1,
      penawaran_return: 12,
      penawaran_nominal: 50_000_000,
      catatan: "Test",
    });
    expect(res.status).toBe(401);
  });

  it("401 dengan token palsu", async () => {
    const res = await request(app)
      .post("/api/v1/negosiasi")
      .set("Authorization", "Bearer token.palsu.ini")
      .send({
        pengajuans_id: 1,
        penawaran_return: 12,
        penawaran_nominal: 50_000_000,
        catatan: "Test",
      });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/negosiasi (getAllNegotiations)", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).get("/api/v1/negosiasi");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/negosiasi/user (getNegotiationByUserId)", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).get("/api/v1/negosiasi/user");
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/v1/negosiasi/:id/reply", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).put("/api/v1/negosiasi/1/reply").send({
      penawaran_return: 10,
      penawaran_nominal: 25_000_000,
      catatan: "Balasan",
    });
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/v1/negosiasi/:id/accept", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).put("/api/v1/negosiasi/1/accept").send({ catatan: "Deal" });
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/v1/negosiasi/:id/reject", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).put("/api/v1/negosiasi/1/reject").send({ catatan: "Tidak cocok" });
    expect(res.status).toBe(401);
  });
});
