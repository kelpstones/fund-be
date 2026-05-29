const TARGET_DEFAULTS = {
  kepuasan_pelanggan: { min: 1.0, max: 5.0 },
  digital_adoption_score: { min: 1.0, max: 10.0 },
  net_profit_margin: { min: -10.0, max: 100.0 }, // Capped min at -10 for default stability
  year_revenue: { min: 18_000_000, max: 50_000_000_000 },
  business_tenure_years: { min: 0.0, max: 50.0 }
};

const QUESTION_MAPPINGS = {
  tujuan_investasi: {
    // short keys
    "pendapatan_stabil": {
      net_profit_margin: { min: 10.0, max: 25.0 },
      business_tenure_years: { min: 4.0, max: 15.0 }
    },
    "stabil": {
      net_profit_margin: { min: 10.0, max: 25.0 },
      business_tenure_years: { min: 4.0, max: 15.0 }
    },
    "pertumbuhan_nilai": {
      net_profit_margin: { min: 30.0, max: 60.0 },
      year_revenue: { min: 500_000_000, max: 10_000_000_000 }
    },
    "tumbuh": {
      net_profit_margin: { min: 30.0, max: 60.0 },
      year_revenue: { min: 500_000_000, max: 10_000_000_000 }
    },
    "dampak_lokal": {
      year_revenue: { min: 18_000_000, max: 300_000_000 }
    },
    "dampak": {
      year_revenue: { min: 18_000_000, max: 300_000_000 }
    },
    "campuran": {
      net_profit_margin: { min: 15.0, max: 35.0 },
      business_tenure_years: { min: 3.0, max: 10.0 }
    },
    // long aliases
    "pendapatan stabil": {
      net_profit_margin: { min: 10.0, max: 25.0 },
      business_tenure_years: { min: 4.0, max: 15.0 }
    },
    "pertumbuhan nilai": {
      net_profit_margin: { min: 30.0, max: 60.0 },
      year_revenue: { min: 500_000_000, max: 10_000_000_000 }
    },
    "dampak ke umkm lokal": {
      year_revenue: { min: 18_000_000, max: 300_000_000 }
    }
  },
  risk_tolerance: {
    // short keys
    "aman_stabil": {
      kepuasan_pelanggan: { min: 4.0, max: 5.0 },
      net_profit_margin: { min: 5.0, max: 20.0 },
      business_tenure_years: { min: 5.0, max: 20.0 }
    },
    "aman": {
      kepuasan_pelanggan: { min: 4.0, max: 5.0 },
      net_profit_margin: { min: 5.0, max: 20.0 },
      business_tenure_years: { min: 5.0, max: 20.0 }
    },
    "seimbang": {
      kepuasan_pelanggan: { min: 3.0, max: 4.5 },
      net_profit_margin: { min: 15.0, max: 40.0 },
      business_tenure_years: { min: 2.0, max: 8.0 }
    },
    "moderat": {
      kepuasan_pelanggan: { min: 3.0, max: 4.5 },
      net_profit_margin: { min: 15.0, max: 40.0 },
      business_tenure_years: { min: 2.0, max: 8.0 }
    },
    "agresif": {
      kepuasan_pelanggan: { min: 1.0, max: 3.5 },
      net_profit_margin: { min: 40.0, max: 100.0 },
      business_tenure_years: { min: 0.0, max: 3.0 }
    },
    // long aliases
    "aman dan stabil": {
      kepuasan_pelanggan: { min: 4.0, max: 5.0 },
      net_profit_margin: { min: 5.0, max: 20.0 },
      business_tenure_years: { min: 5.0, max: 20.0 }
    },
    "agresif asal peluang bagus": {
      kepuasan_pelanggan: { min: 1.0, max: 3.5 },
      net_profit_margin: { min: 40.0, max: 100.0 },
      business_tenure_years: { min: 0.0, max: 3.0 }
    }
  },
  tipe_umkm: {
    // short keys
    "stabil": {
      business_tenure_years: { min: 5.0, max: 30.0 },
      year_revenue: { min: 1_000_000_000, max: 25_000_000_000 }
    },
    "established": {
      business_tenure_years: { min: 5.0, max: 30.0 },
      year_revenue: { min: 1_000_000_000, max: 25_000_000_000 }
    },
    "bertumbuh": {
      business_tenure_years: { min: 2.0, max: 6.0 },
      year_revenue: { min: 300_000_000, max: 5_000_000_000 }
    },
    "growth": {
      business_tenure_years: { min: 2.0, max: 6.0 },
      year_revenue: { min: 300_000_000, max: 5_000_000_000 }
    },
    "berkembang": {
      business_tenure_years: { min: 0.0, max: 2.0 },
      year_revenue: { min: 18_000_000, max: 300_000_000 }
    },
    "potensial": {
      business_tenure_years: { min: 0.0, max: 2.0 },
      year_revenue: { min: 18_000_000, max: 300_000_000 }
    },
    // long aliases
    "sudah berjalan stabil": {
      business_tenure_years: { min: 5.0, max: 30.0 },
      year_revenue: { min: 1_000_000_000, max: 25_000_000_000 }
    },
    "sedang bertumbuh": {
      business_tenure_years: { min: 2.0, max: 6.0 },
      year_revenue: { min: 300_000_000, max: 5_000_000_000 }
    },
    "baru berkembang tapi potensial": {
      business_tenure_years: { min: 0.0, max: 2.0 },
      year_revenue: { min: 18_000_000, max: 300_000_000 }
    }
  },
  cara_memilih: {
    // short keys
    "return": {
      net_profit_margin: { min: 35.0, max: 90.0 }
    },
    "profit": {
      net_profit_margin: { min: 35.0, max: 90.0 }
    },
    "risiko": {
      kepuasan_pelanggan: { min: 4.2, max: 5.0 },
      business_tenure_years: { min: 4.0, max: 15.0 }
    },
    "aman": {
      kepuasan_pelanggan: { min: 4.2, max: 5.0 },
      business_tenure_years: { min: 4.0, max: 15.0 }
    },
    "data": {
      digital_adoption_score: { min: 6.0, max: 10.0 }
    },
    "lengkap": {
      digital_adoption_score: { min: 6.0, max: 10.0 }
    },
    "minat": {
      kepuasan_pelanggan: { min: 3.0, max: 5.0 }
    },
    // long aliases
    "return paling menarik": {
      net_profit_margin: { min: 35.0, max: 90.0 }
    },
    "risiko lebih rendah": {
      kepuasan_pelanggan: { min: 4.2, max: 5.0 },
      business_tenure_years: { min: 4.0, max: 15.0 }
    },
    "bisnis yang datanya paling lengkap": {
      digital_adoption_score: { min: 6.0, max: 10.0 }
    },
    "bisnis yang dekat dengan minat saya": {
      kepuasan_pelanggan: { min: 3.0, max: 5.0 }
    }
  }
};

/**
 * Normalizes input string for consistent matching
 */
const normalizeText = (text) => {
  if (text === undefined || text === null) return "";
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[-_/]/g, ' ')
    .replace(/\s+/g, ' ');
};

/**
 * Aggregates questionnaire answers into numerical ranges and generates numerical metrics
 */
const mapQuestionnaireToMetrics = (body = {}) => {
  const resultRanges = {
    kepuasan_pelanggan: [],
    digital_adoption_score: [],
    net_profit_margin: [],
    year_revenue: [],
    business_tenure_years: []
  };

  const fields = ['tujuan_investasi', 'risk_tolerance', 'tipe_umkm', 'cara_memilih'];

  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null) continue;

    const normalizedVal = normalizeText(val);
    const mappings = QUESTION_MAPPINGS[field];
    if (!mappings) continue;

    // Find direct matching key or alias
    let matchedMetrics = null;
    for (const [key, metrics] of Object.entries(mappings)) {
      if (normalizeText(key) === normalizedVal) {
        matchedMetrics = metrics;
        break;
      }
    }

    if (matchedMetrics) {
      for (const [metricName, range] of Object.entries(matchedMetrics)) {
        if (resultRanges[metricName]) {
          resultRanges[metricName].push(range);
        }
      }
    }
  }

  // Generate final metrics
  const finalMetrics = {};
  for (const [metricName, ranges] of Object.entries(resultRanges)) {
    let min, max;
    if (ranges.length === 0) {
      // Use target defaults if not covered by selected questionnaire answers
      min = TARGET_DEFAULTS[metricName].min;
      max = TARGET_DEFAULTS[metricName].max;
    } else {
      // Average the min and max boundaries
      const sumMin = ranges.reduce((sum, r) => sum + r.min, 0);
      const sumMax = ranges.reduce((sum, r) => sum + r.max, 0);
      min = sumMin / ranges.length;
      max = sumMax / ranges.length;
    }

    // Pick a random float/int within the averaged boundaries
    const val = Math.random() * (max - min) + min;

    if (metricName === 'year_revenue') {
      finalMetrics[metricName] = Math.floor(val);
    } else {
      finalMetrics[metricName] = parseFloat(val.toFixed(2));
    }
  }

  return finalMetrics;
};

/**
 * Normalizes sectors query/array parameter and maps to business enum tipe_usaha values
 */
const mapSektorToTipeUsaha = (sektorInput) => {
  if (!sektorInput) return [];
  
  let sectorsList = [];
  if (Array.isArray(sektorInput)) {
    sectorsList = sektorInput;
  } else if (typeof sektorInput === 'string') {
    sectorsList = sektorInput.split(',').map(s => s.trim());
  }

  const tipeUsahaSet = new Set();
  let hasBebas = false;

  for (const s of sectorsList) {
    const norm = normalizeText(s);
    if (!norm) continue;

    if (norm === 'bebas') {
      hasBebas = true;
      break;
    }

    if (norm === 'kuliner') {
      tipeUsahaSet.add('kuliner');
    } else if (norm === 'fashion') {
      tipeUsahaSet.add('fashion');
    } else if (norm === 'agribisnis' || norm === 'pertanian') {
      tipeUsahaSet.add('pertanian');
    } else if (norm === 'jasa teknologi' || norm === 'jasa' || norm === 'teknologi') {
      tipeUsahaSet.add('jasa');
      tipeUsahaSet.add('teknologi');
    } else {
      // Fallback for standard db enum categories
      tipeUsahaSet.add(norm);
    }
  }

  if (hasBebas) return [];
  return Array.from(tipeUsahaSet);
};

module.exports = {
  QUESTION_MAPPINGS,
  TARGET_DEFAULTS,
  mapQuestionnaireToMetrics,
  mapSektorToTipeUsaha
};
