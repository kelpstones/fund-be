const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../src/app");
const knex = require("../../src/config/db");

const API_KEY = process.env.API_KEY || "test-api-key";
const CALLBACK_TOKEN = "xendit-test-callback-token";

jest.mock("../../src/utils/xendit", () => {
  return {
    Invoice: {
      createInvoice: jest.fn().mockImplementation((payload) => {
        const { externalId, amount, payerEmail } = payload.data;
        return Promise.resolve({
          id: `mock-inv-${externalId}`,
          external_id: externalId,
          amount,
          payer_email: payerEmail,
          status: "PENDING",
          invoiceUrl: `https://checkout.xendit.co/v2/invoices/mock-${externalId}`,
          invoice_url: `https://checkout.xendit.co/v2/invoices/mock-${externalId}`,
        });
      }),
    },
  };
});

jest.mock("../../src/utils/mailer", () => {
  return {
    sendVerificationEmail: jest.fn().mockResolvedValue({}),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({}),
    sendInvoiceEmail: jest.fn().mockResolvedValue({}),
    sendNegotiationStartEmail: jest.fn().mockResolvedValue({}),
    sendNegotiationReplyEmail: jest.fn().mockResolvedValue({}),
    sendNegotiationDealEmail: jest.fn().mockResolvedValue({}),
    sendNegotiationRejectedEmail: jest.fn().mockResolvedValue({}),
    sendTopUpPendingEmail: jest.fn().mockResolvedValue({}),
    sendTopUpSuccessEmail: jest.fn().mockResolvedValue({}),
    sendWithdrawalPendingEmail: jest.fn().mockResolvedValue({}),
    sendWithdrawalSuccessEmail: jest.fn().mockResolvedValue({}),
    sendWithdrawalFailedEmail: jest.fn().mockResolvedValue({}),
  };
});

describe("Wallet & Xendit Callback Integration Tests", () => {
  let investorToken;
  let adminToken;
  let investorUser;
  let umkmUser;
  let bisnis;
  let pengajuan;
  let negosiasi;
  let invoice;

  beforeAll(async () => {
   
    process.env.XENDIT_CALLBACK_TOKEN = CALLBACK_TOKEN;

   
    await knex.raw(
      "TRUNCATE TABLE users, bisnis, pengajuans, invoices, transaksis, investasis RESTART IDENTITY CASCADE"
    );

    // Get role IDs
    const investorRole = await knex("roles").where({ nama: "investor" }).first();
    const umkmRole = await knex("roles").where({ nama: "umkm" }).first();

    const investorRoleId = investorRole ? investorRole.id : 2;
    const umkmRoleId = umkmRole ? umkmRole.id : 1;


    [investorUser] = await knex("users")
      .insert({
        nama: "Investor Budi",
        email: "budi.investor@example.com",
        password: "hashedpassword123",
        nik: "1234567890123456",
        no_telp: "08123456789",
        role_id: investorRoleId,
        saldo: 5000000, 
        email_verified: true,
      })
      .returning("*");

  
    investorToken = jwt.sign(
      {
        id: investorUser.id,
        email: investorUser.email,
        role_name: "investor",
      },
      process.env.JWT_SECRET
    );

    adminToken = jwt.sign(
      {
        id: 99,
        email: "admin@fundraise.id",
        level: "admin",
      },
      process.env.JWT_SECRET_ADMIN
    );

 
    [umkmUser] = await knex("users")
      .insert({
        nama: "Siti UMKM",
        email: "siti.umkm@example.com",
        password: "hashedpassword123",
        nik: "9876543210987654",
        no_telp: "08987654321",
        role_id: umkmRoleId,
        email_verified: true,
      })
      .returning("*");

  
    const kelasRecord = await knex("kelas").first();
    const kelasId = kelasRecord ? kelasRecord.id : 1;


    [bisnis] = await knex("bisnis")
      .insert({
        user_id: umkmUser.id,
        nama_bisnis: "Toko Kelontong Siti",
        tipe_usaha: "perdagangan",
        email: "tokositi@example.com",
        no_telp: "08987654322",
        alamat: "Jl. Merdeka No. 10",
        deskripsi: "Toko sembako merdeka",
        kelas_id: kelasId,
      })
      .returning("*");

    [pengajuan] = await knex("pengajuans")
      .insert({
        bisnis_id: bisnis.id,
        target_pendanaan: 10000000, // Rp 10.000.000
        total_pendanaan: 0,
        per_anual_return: 15,
        status: "published",
      })
      .returning("*");

    
    [negosiasi] = await knex("negosiasis")
      .insert({
        pengajuans_id: pengajuan.id,
        investor_id: investorUser.id,
        status: "deal",
        id_terakhir_oleh: investorUser.id,
      })
      .returning("*");


    [invoice] = await knex("invoices")
      .insert({
        negosiasi_id: negosiasi.id,
        pengajuan_id: pengajuan.id,
        investor_id: investorUser.id,
        nominal_tagihan: 1000000, // Rp 1.000.000
        ppn: 12,
        ppn_amount: 1200,
        biaya_admin: 10000,
        total_nominal: 1011200, // Total = 1.000.000 + 10.000 + 1200
        return_investasi: 15,
        status: "pending",
        kode_pembayaran: "KODE-INV-001",
        tenggat_waktu: new Date(Date.now() + 86400000),
      })
      .returning("*");
  });

  afterAll(async () => {
    // Clean up connections
    await knex.destroy();
  });

  describe("GET /api/v1/wallet/dashboard", () => {
    it("harus mengembalikan detail saldo dan pagination transaksi", async () => {
      const res = await request(app)
        .get("/api/v1/wallet/dashboard")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(parseFloat(res.body.data.saldo)).toBe(5000000);
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });
  });

  describe("POST /api/v1/wallet/topup", () => {
    it("harus gagal jika jumlah kurang dari 10000", async () => {
      const res = await request(app)
        .post("/api/v1/wallet/topup")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`)
        .send({ jumlah: 5000 });

      expect(res.status).toBe(400);
    });

    it("harus berhasil membuat invoice Xendit dan mencatat transaksi pending", async () => {
      const res = await request(app)
        .post("/api/v1/wallet/topup")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`)
        .send({ jumlah: 150000 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.payment_url).toContain("checkout.xendit.co");
      expect(res.body.data.transaksi.status).toBe("pending");
      expect(res.body.data.transaksi.tipe).toBe("deposit");
      expect(parseFloat(res.body.data.transaksi.jumlah)).toBe(150000);

    
      const dbTx = await knex("transaksis")
        .where({ external_id: res.body.data.transaksi.external_id })
        .first();
      expect(dbTx).toBeDefined();
      expect(dbTx.status).toBe("pending");
    });
  });

  describe("POST /api/v1/wallet/withdraw", () => {
    it("harus gagal jika penarikan kurang dari 50000", async () => {
      const res = await request(app)
        .post("/api/v1/wallet/withdraw")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`)
        .send({ jumlah: 20000 });

      expect(res.status).toBe(400);
    });

    it("harus gagal jika saldo tidak mencukupi", async () => {
      const res = await request(app)
        .post("/api/v1/wallet/withdraw")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`)
        .send({ jumlah: 10000000 });

      expect(res.status).toBe(400);
    });

    it("harus berhasil memotong saldo dan membuat transaksi penarikan pending", async () => {
      const initialUser = await knex("users").where({ id: investorUser.id }).first();
      const initialSaldo = parseFloat(initialUser.saldo);

      const res = await request(app)
        .post("/api/v1/wallet/withdraw")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`)
        .send({ jumlah: 100000 }); // Tarik Rp 100.000

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(parseFloat(res.body.data.saldo_saat_ini)).toBe(initialSaldo - 100000);
      expect(res.body.data.transaksi.status).toBe("pending");
      expect(res.body.data.transaksi.tipe).toBe("penarikan");

      // Verify user saldo updated in DB
      const updatedUser = await knex("users").where({ id: investorUser.id }).first();
      expect(parseFloat(updatedUser.saldo)).toBe(initialSaldo - 100000);
    });
  });

  describe("POST /api/v1/wallet/pay-invoice/:invoice_id", () => {
    it("harus berhasil membayar invoice via saldo dompet virtual", async () => {
      const userBefore = await knex("users").where({ id: investorUser.id }).first();
      const saldoBefore = parseFloat(userBefore.saldo);

      const res = await request(app)
        .post(`/api/v1/wallet/pay-invoice/${invoice.id}`)
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.invoice.status).toBe("paid");
      expect(parseFloat(res.body.data.saldo_saat_ini)).toBe(saldoBefore - parseFloat(invoice.total_nominal));

      // Verify db transaction logged
      expect(res.body.data.transaksi.status).toBe("completed");
      expect(res.body.data.transaksi.tipe).toBe("investasi");

      // Verify investments table updated
      const investRecord = await knex("investasis")
        .where({ investor_id: investorUser.id, pengajuans_id: pengajuan.id })
        .first();
      expect(investRecord).toBeDefined();
      expect(parseFloat(investRecord.nominal_investasi)).toBe(parseFloat(invoice.nominal_tagihan));

      // Verify project funding updated
      const updatedPengajuan = await knex("pengajuans").where({ id: pengajuan.id }).first();
      expect(parseFloat(updatedPengajuan.total_pendanaan)).toBe(parseFloat(invoice.nominal_tagihan));
    });

    it("harus gagal jika invoice sudah dibayar", async () => {
      const res = await request(app)
        .post(`/api/v1/wallet/pay-invoice/${invoice.id}`)
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Hanya invoice pending yang dapat dibayar");
    });
  });

  describe("POST /api/v1/wallet/mock-topup", () => {
    it("harus berhasil menambahkan Rp 10.000.000 secara instan di env test", async () => {
      const userBefore = await knex("users").where({ id: investorUser.id }).first();
      const saldoBefore = parseFloat(userBefore.saldo);

      const res = await request(app)
        .post("/api/v1/wallet/mock-topup")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(parseFloat(res.body.data.saldo_saat_ini)).toBe(saldoBefore + 10000000);

      // Verify db transaction log
      expect(res.body.data.transaksi.status).toBe("completed");
      expect(res.body.data.transaksi.tipe).toBe("deposit");
    });
  });

  describe("POST /api/v1/wallet/xendit-callback", () => {
    it("harus ditolak jika callback token tidak valid", async () => {
      const res = await request(app)
        .post("/api/v1/wallet/xendit-callback")
        .set("x-api-key", API_KEY)
        .set("x-callback-token", "salah-token")
        .send({ external_id: "topup-123", status: "PAID", amount: 100000 });

      expect(res.status).toBe(403);
    });

    it("harus berhasil memproses callback topup yang valid", async () => {
      const userBefore = await knex("users").where({ id: investorUser.id }).first();
      const saldoBefore = parseFloat(userBefore.saldo);

      // Create a pending topup transaction in DB
      const external_id = `topup-webtest-${Date.now()}`;
      await knex("transaksis").insert({
        user_id: investorUser.id,
        external_id,
        tipe: "deposit",
        jumlah: 250000,
        status: "pending",
        deskripsi: "Top Up pending",
      });

      // Fire webhook callback
      const res = await request(app)
        .post("/api/v1/wallet/xendit-callback")
        .set("x-api-key", API_KEY)
        .set("x-callback-token", CALLBACK_TOKEN)
        .send({
          external_id,
          status: "PAID",
          amount: 250000,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Callback processed successfully");

      // Verify user saldo updated
      const userAfter = await knex("users").where({ id: investorUser.id }).first();
      expect(parseFloat(userAfter.saldo)).toBe(saldoBefore + 250000);

      // Verify transaction status changed to completed
      const tx = await knex("transaksis").where({ external_id }).first();
      expect(tx.status).toBe("completed");
    });

    it("harus berhasil memproses callback pembayaran direct invoice", async () => {
      // Create another pending invoice
      const [invoice2] = await knex("invoices")
        .insert({
          negosiasi_id: negosiasi.id,
          pengajuan_id: pengajuan.id,
          investor_id: investorUser.id,
          nominal_tagihan: 1500000,
          ppn: 12,
          ppn_amount: 1800,
          biaya_admin: 15000,
          total_nominal: 1516800,
          return_investasi: 15,
          status: "pending",
          kode_pembayaran: "KODE-INV-002",
          tenggat_waktu: new Date(Date.now() + 86400000),
        })
        .returning("*");

      const external_id = `invoice-${invoice2.kode_pembayaran}`;

      // Fire webhook callback
      const res = await request(app)
        .post("/api/v1/wallet/xendit-callback")
        .set("x-api-key", API_KEY)
        .set("x-callback-token", CALLBACK_TOKEN)
        .send({
          external_id,
          status: "PAID",
          amount: 1516800,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Callback processed successfully (Direct payment completed)");

      // Verify invoice status changed to paid
      const updatedInv = await knex("invoices").where({ id: invoice2.id }).first();
      expect(updatedInv.status).toBe("paid");

      // Verify investment created
      const investRecord = await knex("investasis")
        .where({ investor_id: investorUser.id, return_investasi: 15 })
        .orderBy("id", "desc")
        .first();
      expect(investRecord).toBeDefined();
      expect(parseFloat(investRecord.nominal_investasi)).toBe(1500000);
    });
  });

  describe("Admin Withdrawal Approval / Rejection Tests", () => {
    let pendingWithdrawTx;

    beforeEach(async () => {
      const [tx] = await knex("transaksis").insert({
        user_id: investorUser.id,
        external_id: `withdraw-test-${Date.now()}`,
        tipe: "penarikan",
        jumlah: 100000,
        status: "pending",
        deskripsi: "Penarikan test",
      }).returning("*");
      pendingWithdrawTx = tx;
    });

    it("harus menolak akses jika diakses tanpa token admin", async () => {
      const res = await request(app)
        .get("/api/v1/wallet/withdrawals")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${investorToken}`);

      expect(res.status).toBe(403);
    });

    it("harus berhasil mengambil semua daftar penarikan dana", async () => {
      const res = await request(app)
        .get("/api/v1/wallet/withdrawals")
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].tipe).toBe("penarikan");
    });

    it("harus berhasil menyetujui (completed) permintaan penarikan dana", async () => {
      const res = await request(app)
        .put(`/api/v1/wallet/withdrawals/${pendingWithdrawTx.id}/status`)
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "completed" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.transaksi.status).toBe("completed");

      const dbTx = await knex("transaksis").where({ id: pendingWithdrawTx.id }).first();
      expect(dbTx.status).toBe("completed");
    });

    it("harus berhasil menolak (failed) permintaan penarikan dana dan mengembalikan saldo", async () => {
      const userBefore = await knex("users").where({ id: investorUser.id }).first();
      const saldoBefore = parseFloat(userBefore.saldo);

      const res = await request(app)
        .put(`/api/v1/wallet/withdrawals/${pendingWithdrawTx.id}/status`)
        .set("x-api-key", API_KEY)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "failed" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.transaksi.status).toBe("failed");

      const userAfter = await knex("users").where({ id: investorUser.id }).first();
      expect(parseFloat(userAfter.saldo)).toBe(saldoBefore + parseFloat(pendingWithdrawTx.jumlah));
    });
  });
});
