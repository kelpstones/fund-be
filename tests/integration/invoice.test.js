const request = require("supertest");
const app = require("../../src/app");

describe("GET /api/v1/invoice (getAllInvoices)", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).get("/api/v1/invoice");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/invoice/:id", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).get("/api/v1/invoice/1");
    expect(res.status).toBe(401);
  });

  it("401 dengan token palsu", async () => {
    const res = await request(app)
      .get("/api/v1/invoice/1")
      .set("Authorization", "Bearer token.palsu.ini");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/invoice/:id/pay (markInvoiceAsPaid)", () => {
  it("401 tanpa token", async () => {
    const res = await request(app).patch("/api/v1/invoice/1/pay");
    expect(res.status).toBe(401);
  });
});
