const { PengajuanValidator } = require("../../../src/validation");

const VALID_PENGAJUAN = {
  bisnis_id: 1,
  target_pendanaan: 100_000_000, // integer (wajib)
  per_anual_return: 15, // integer (wajib)
};

describe("PengajuanValidator.pengajuanValidation — field wajib", () => {
  it("lulus dengan field minimal (bisnis_id + target + return)", () => {
    const { error } = PengajuanValidator.pengajuanValidation(VALID_PENGAJUAN);
    expect(error).toBeUndefined();
  });

  it("lulus dengan field opsional (deskripsi_peluang)", () => {
    const { error } = PengajuanValidator.pengajuanValidation({
      ...VALID_PENGAJUAN,
      deskripsi_peluang: "Peluang usaha kuliner yang menjanjikan",
    });
    expect(error).toBeUndefined();
  });

  it("gagal jika bisnis_id tidak ada", () => {
    const { bisnis_id, ...rest } = VALID_PENGAJUAN;
    const { error } = PengajuanValidator.pengajuanValidation(rest);
    expect(error).toBeDefined();
  });

  it("gagal jika bisnis_id bukan integer", () => {
    const { error } = PengajuanValidator.pengajuanValidation({
      ...VALID_PENGAJUAN,
      bisnis_id: 1.5,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika target_pendanaan tidak ada", () => {
    const { target_pendanaan, ...rest } = VALID_PENGAJUAN;
    const { error } = PengajuanValidator.pengajuanValidation(rest);
    expect(error).toBeDefined();
  });

  it("gagal jika target_pendanaan bukan integer (desimal)", () => {
    const { error } = PengajuanValidator.pengajuanValidation({
      ...VALID_PENGAJUAN,
      target_pendanaan: 100_000_000.5,
    });
    expect(error).toBeDefined();
  });

  it("gagal jika per_anual_return tidak ada", () => {
    const { per_anual_return, ...rest } = VALID_PENGAJUAN;
    const { error } = PengajuanValidator.pengajuanValidation(rest);
    expect(error).toBeDefined();
  });

  it("gagal jika per_anual_return bukan integer (desimal)", () => {
    const { error } = PengajuanValidator.pengajuanValidation({
      ...VALID_PENGAJUAN,
      per_anual_return: 12.5,
    });
    expect(error).toBeDefined();
  });
});

describe("PengajuanValidator.pengajuanValidation — rencana_penggunaan_dana", () => {
  it("lulus dengan rencana_penggunaan_dana valid (2 item)", () => {
    const { error } = PengajuanValidator.pengajuanValidation({
      ...VALID_PENGAJUAN,
      rencana_penggunaan_dana: [
        { kategori: "Modal Kerja", jumlah: 60_000_000 },
        { kategori: "Peralatan", jumlah: 40_000_000 },
      ],
    });
    expect(error).toBeUndefined();
  });

  it("lulus tanpa rencana_penggunaan_dana (opsional)", () => {
    const { error } = PengajuanValidator.pengajuanValidation(VALID_PENGAJUAN);
    expect(error).toBeUndefined();
  });

  it("gagal jika item rencana tidak punya kategori", () => {
    const { error } = PengajuanValidator.pengajuanValidation({
      ...VALID_PENGAJUAN,
      rencana_penggunaan_dana: [{ jumlah: 60_000_000 }],
    });
    expect(error).toBeDefined();
  });

  it("gagal jika item rencana tidak punya jumlah", () => {
    const { error } = PengajuanValidator.pengajuanValidation({
      ...VALID_PENGAJUAN,
      rencana_penggunaan_dana: [{ kategori: "Modal Kerja" }],
    });
    expect(error).toBeDefined();
  });

  it("gagal jika jumlah dalam rencana bukan integer", () => {
    const { error } = PengajuanValidator.pengajuanValidation({
      ...VALID_PENGAJUAN,
      rencana_penggunaan_dana: [
        { kategori: "Modal Kerja", jumlah: 60_000_000.5 },
      ],
    });
    expect(error).toBeDefined();
  });
});

describe("PengajuanValidator.updatePengajuanValidation — field opsional", () => {
  it("lulus dengan object kosong (semua opsional)", () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({});
    expect(error).toBeUndefined();
  });

  it("lulus update target_pendanaan saja", () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({
      target_pendanaan: 200_000_000,
    });
    expect(error).toBeUndefined();
  });

  it("lulus update per_anual_return saja", () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({
      per_anual_return: 20,
    });
    expect(error).toBeUndefined();
  });

  it("lulus update total_pendanaan saja", () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({
      total_pendanaan: 75_000_000,
    });
    expect(error).toBeUndefined();
  });
});

describe("PengajuanValidator.updatePengajuanValidation — field status", () => {
  const VALID_STATUSES = [
    "draft",
    "published",
    "negotiating",
    "funded",
    "rejected",
  ];

  VALID_STATUSES.forEach((status) => {
    it(`lulus dengan status "${status}"`, () => {
      const { error } = PengajuanValidator.updatePengajuanValidation({
        status,
      });
      expect(error).toBeUndefined();
    });
  });

  it('gagal jika status bukan nilai yang valid (misal: "aktif")', () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({
      status: "aktif",
    });
    expect(error).toBeDefined();
  });

  it('gagal jika status bukan nilai yang valid (misal: "closed")', () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({
      status: "closed",
    });
    expect(error).toBeDefined();
  });
});

describe("PengajuanValidator.updatePengajuanValidation — rencana_penggunaan_dana", () => {
  it("lulus update rencana dengan item valid", () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({
      rencana_penggunaan_dana: [{ kategori: "Marketing", jumlah: 10_000_000 }],
    });
    expect(error).toBeUndefined();
  });

  it("gagal jika item rencana tidak punya kategori", () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({
      rencana_penggunaan_dana: [{ jumlah: 10_000_000 }],
    });
    expect(error).toBeDefined();
  });

  it("gagal jika jumlah rencana bukan integer", () => {
    const { error } = PengajuanValidator.updatePengajuanValidation({
      rencana_penggunaan_dana: [
        { kategori: "Marketing", jumlah: 10_000_000.99 },
      ],
    });
    expect(error).toBeDefined();
  });
});
