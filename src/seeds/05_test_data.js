const bcrypt = require("bcryptjs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clear only data associated with our test seeds to avoid deleting user's custom records
  const existingUmkm = await knex("users").where({ email: "danen.umkm55@gmail.com" }).first();
  const existingInvestor = await knex("users").where({ email: "john.investor@gmail.com" }).first();

  if (existingUmkm) {
    const umkmBisnis = await knex("bisnis").where({ user_id: existingUmkm.id }).select("id");
    const bisnisIds = umkmBisnis.map(b => b.id);
    
    if (bisnisIds.length > 0) {
      const proposals = await knex("pengajuans").whereIn("bisnis_id", bisnisIds).select("id");
      const proposalIds = proposals.map(p => p.id);
      
      if (proposalIds.length > 0) {
        const negotiations = await knex("negosiasis").whereIn("pengajuans_id", proposalIds).select("id");
        const negosiasiIds = negotiations.map(n => n.id);
        
        if (negosiasiIds.length > 0) {
          await knex("distribusi_profits").whereIn("investasi_id", function() {
            this.select("id").from("investasis").whereIn("negosiasis_id", negosiasiIds);
          }).del();
          await knex("invoices").whereIn("negosiasi_id", negosiasiIds).del();
          await knex("log_negosiasis").whereIn("negosiasis_id", negosiasiIds).del();
          await knex("investasis").whereIn("negosiasis_id", negosiasiIds).del();
          await knex("negosiasis").whereIn("id", negosiasiIds).del();
        }
        
        await knex("penjualans").whereIn("pengajuans_id", proposalIds).del();
        await knex("approvals").whereIn("pengajuans_id", proposalIds).del();
        await knex("pengajuans").whereIn("id", proposalIds).del();
      }
      
      await knex("bisnis_profiles").whereIn("bisnis_id", bisnisIds).del();
      await knex("bisnis").whereIn("id", bisnisIds).del();
    }
    
    await knex("transaksis").where({ user_id: existingUmkm.id }).del();
    await knex("users").where({ id: existingUmkm.id }).del();
  }

  if (existingInvestor) {
    await knex("transaksis").where({ user_id: existingInvestor.id }).del();
    await knex("users").where({ id: existingInvestor.id }).del();
  }

  const passwordHash = await bcrypt.hash("secret123", 10);

  // 1. Insert UMKM User (Danen UMKM)
  const [umkmUser] = await knex("users").insert({
    nama: "Danen UMKM",
    email: "danen.umkm55@gmail.com",
    nik: "3273010101010001",
    no_telp: "081234567890",
    role_id: 1, // umkm
    is_onboarded: 1,
    email_verified: true,
    password: passwordHash,
    saldo: 0.00
  }).returning("*");

  // 2. Insert Investor User (John Investor)
  const [investorUser] = await knex("users").insert({
    nama: "John Investor",
    email: "john.investor@gmail.com",
    nik: "3273010101010002",
    no_telp: "081234567891",
    role_id: 2, // investor
    is_onboarded: 1,
    email_verified: true,
    password: passwordHash,
    saldo: 1000000000.00 // 1B IDR
  }).returning("*");

  // Get kelas IDs
  const mikroClass = await knex("kelas").where({ nama_kelas: "mikro" }).first();

  // 3. Insert Bisnis (Toko Roti Danen)
  const [bisnis] = await knex("bisnis").insert({
    user_id: umkmUser.id,
    kelas_id: mikroClass.id,
    nama_bisnis: "Toko Roti Danen",
    tipe_usaha: "kuliner",
    alamat: "Jl. Roti No. 5, Bandung",
    no_telp: "081234567890",
    email: "danen.umkm55@gmail.com",
    deskripsi: "Toko roti legendaris dengan resep kuno.",
    is_verified: true,
    verified_at: knex.fn.now()
  }).returning("*");

  // 4. Insert Bisnis Profile (Operational metrics)
  await knex("bisnis_profiles").insert({
    bisnis_id: bisnis.id,
    net_profit_margin: 25.50,
    kepuasan_pelanggan: 4.8,
    peak_hour_latency: "low",
    review_volatility: 1.20,
    repeat_order_rate: 65.00,
    digital_adoption_score: 8.5,
    year_revenue: 500000000.00,
    business_tenure_years: 3.50,
    tim_operasional: true,
    class: 2 // Growth
  });

  // 5. Insert Pengajuans (Proposals)
  // Proposal 1: Draft
  await knex("pengajuans").insert({
    bisnis_id: bisnis.id,
    target_pendanaan: 100000000.00,
    per_anual_return: 12.00,
    status: "draft",
    deskripsi_peluang: "Ekspansi pembukaan cabang baru di daerah Dago",
    rencana_penggunaan_dana: JSON.stringify([
      { kategori: "Sewa Tempat", jumlah: 40000000 },
      { kategori: "Renovasi", jumlah: 30000000 },
      { kategori: "Marketing", jumlah: 30000000 }
    ])
  });

  // Proposal 2: Published / Active (Fully Funded)
  const [proposalPublished] = await knex("pengajuans").insert({
    bisnis_id: bisnis.id,
    target_pendanaan: 50000000.00,
    total_pendanaan: 50000000.00,
    per_anual_return: 15.00,
    status: "funded",
    locked_by_investor_id: investorUser.id,
    locked_at: knex.fn.now(),
    deskripsi_peluang: "Pembelian mesin pemanggang roti otomatis berkapasitas besar",
    rencana_penggunaan_dana: JSON.stringify([
      { kategori: "Mesin Oven", jumlah: 35000000 },
      { kategori: "Instalasi Listrik", jumlah: 15000000 }
    ])
  }).returning("*");

  // Get admin (John Doe)
  const adminUser = await knex("admins").where({ email: "john@example.com" }).first();

  // 6. Insert Approval for Proposal 2
  await knex("approvals").insert({
    pengajuans_id: proposalPublished.id,
    approver_id: adminUser.id,
    status: "approved",
    catatan: "Dokumen lengkap dan kelayakan usaha sangat baik"
  });

  // 7. Insert Negosiasi (Negotiation)
  const [negosiasi] = await knex("negosiasis").insert({
    pengajuans_id: proposalPublished.id,
    investor_id: investorUser.id,
    status: "deal",
    id_terakhir_oleh: investorUser.id
  }).returning("*");

  // 8. Insert Log Negosiasi
  await knex("log_negosiasis").insert({
    negosiasis_id: negosiasi.id,
    pengirim_id: investorUser.id,
    penawaran_return: 15.00,
    penawaran_nominal: 50000000.00,
    diajukan_oleh: "investor",
    status: "accepted",
    catatan: "Tertarik mendanai mesin pemanggang roti Anda."
  });

  // 9. Insert Investasi (Investment)
  const [investasi] = await knex("investasis").insert({
    investor_id: investorUser.id,
    pengajuans_id: proposalPublished.id,
    negosiasis_id: negosiasi.id,
    nominal_investasi: 50000000.00,
    return_investasi: 15.00
  }).returning("*");

  // 10. Insert Invoice
  await knex("invoices").insert({
    negosiasi_id: negosiasi.id,
    pengajuan_id: proposalPublished.id,
    investor_id: investorUser.id,
    nominal_tagihan: 50000000.00,
    ppn: 11.00,
    ppn_amount: 5500000.00,
    biaya_admin: 500000.00,
    total_nominal: 56000000.00,
    return_investasi: 15.00,
    kode_pembayaran: "INV-ROTI-001",
    tenggat_waktu: new Date(Date.now() + 86400000 * 7),
    status: "paid"
  });

  // 11. Insert Penjualans (Sales Reports)
  const [salesJan] = await knex("penjualans").insert({
    pengajuans_id: proposalPublished.id,
    periode: "2026-01",
    total_penjualan: 15000000,
    jumlah_transaksi: 120,
    laba_bersih: 3500000,
    laba_kotor: 6000000
  }).returning("*");

  const [salesFeb] = await knex("penjualans").insert({
    pengajuans_id: proposalPublished.id,
    periode: "2026-02",
    total_penjualan: 17500000,
    jumlah_transaksi: 145,
    laba_bersih: 4200000,
    laba_kotor: 7500000
  }).returning("*");

  // 12. Insert Distribusi Profits
  await knex("distribusi_profits").insert([
    {
      penjualans_id: salesJan.id,
      investasi_id: investasi.id,
      investor_id: investorUser.id,
      nominal_profit: 525000, // 3500000 * 15%
      periode: "2026-01",
      status: "distributed"
    },
    {
      penjualans_id: salesFeb.id,
      investasi_id: investasi.id,
      investor_id: investorUser.id,
      nominal_profit: 630000, // 4200000 * 15%
      periode: "2026-02",
      status: "distributed"
    }
  ]);

  // 13. Insert Transaksis (Transaction Log)
  await knex("transaksis").insert([
    {
      user_id: investorUser.id,
      external_id: "DEP-001",
      tipe: "deposit",
      jumlah: 100000000.00,
      status: "completed",
      deskripsi: "Deposit awal modal investasi"
    },
    {
      user_id: investorUser.id,
      external_id: "INV-ROTI-001",
      tipe: "investasi",
      jumlah: 56000000.00,
      status: "completed",
      deskripsi: "Pembayaran investasi Toko Roti Danen"
    },
    {
      user_id: investorUser.id,
      external_id: "PROFIT-001",
      tipe: "bagi_hasil",
      jumlah: 525000.00,
      status: "completed",
      deskripsi: "Bagi hasil proyek Toko Roti Danen periode 2026-01"
    },
    {
      user_id: investorUser.id,
      external_id: "PROFIT-002",
      tipe: "bagi_hasil",
      jumlah: 630000.00,
      status: "completed",
      deskripsi: "Bagi hasil proyek Toko Roti Danen periode 2026-02"
    }
  ]);
};
