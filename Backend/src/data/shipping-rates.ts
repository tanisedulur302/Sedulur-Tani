/**
 * Static shipping rates data
 * Origin: Surabaya
 * Rates in IDR
 */

export interface City {
  id: string;
  name: string;
  province: string;
  type?: "Kota" | "Kabupaten";
}

export interface ShippingRate {
  service: string;
  description: string;
  cost: number;
  etd: string; // Estimated Time Delivery in days
}

export interface CourierRates {
  [courier: string]: ShippingRate[];
}

// Daftar kota tujuan diperluas
export const CITIES: City[] = [
  // Jawa Timur
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", type: "Kota" },
  { id: "malang", name: "Malang", province: "Jawa Timur", type: "Kota" },
  {
    id: "kab_malang",
    name: "Kabupaten Malang",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  {
    id: "sidoarjo",
    name: "Sidoarjo",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  { id: "gresik", name: "Gresik", province: "Jawa Timur", type: "Kabupaten" },
  {
    id: "mojokerto",
    name: "Mojokerto",
    province: "Jawa Timur",
    type: "Kota",
  },
  {
    id: "kab_mojokerto",
    name: "Kabupaten Mojokerto",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  { id: "jember", name: "Jember", province: "Jawa Timur", type: "Kabupaten" },
  { id: "kediri", name: "Kediri", province: "Jawa Timur", type: "Kota" },
  {
    id: "kab_kediri",
    name: "Kabupaten Kediri",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  {
    id: "probolinggo",
    name: "Probolinggo",
    province: "Jawa Timur",
    type: "Kota",
  },
  {
    id: "kab_probolinggo",
    name: "Kabupaten Probolinggo",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  {
    id: "pasuruan",
    name: "Pasuruan",
    province: "Jawa Timur",
    type: "Kota",
  },
  {
    id: "kab_pasuruan",
    name: "Kabupaten Pasuruan",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  { id: "madiun", name: "Madiun", province: "Jawa Timur", type: "Kota" },
  {
    id: "kab_madiun",
    name: "Kabupaten Madiun",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  {
    id: "banyuwangi",
    name: "Banyuwangi",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  { id: "tuban", name: "Tuban", province: "Jawa Timur", type: "Kabupaten" },
  { id: "blitar", name: "Blitar", province: "Jawa Timur", type: "Kota" },
  {
    id: "kab_blitar",
    name: "Kabupaten Blitar",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  { id: "batu", name: "Batu", province: "Jawa Timur", type: "Kota" },
  {
    id: "lamongan",
    name: "Lamongan",
    province: "Jawa Timur",
    type: "Kabupaten",
  },
  {
    id: "bojonegoro",
    name: "Bojonegoro",
    province: "Jawa Timur",
    type: "Kabupaten",
  },

  // Jawa Tengah
  {
    id: "semarang",
    name: "Semarang",
    province: "Jawa Tengah",
    type: "Kota",
  },
  {
    id: "kab_semarang",
    name: "Kabupaten Semarang",
    province: "Jawa Tengah",
    type: "Kabupaten",
  },
  { id: "solo", name: "Surakarta", province: "Jawa Tengah", type: "Kota" },
  {
    id: "sukoharjo",
    name: "Sukoharjo",
    province: "Jawa Tengah",
    type: "Kabupaten",
  },
  {
    id: "magelang",
    name: "Magelang",
    province: "Jawa Tengah",
    type: "Kota",
  },
  {
    id: "kab_magelang",
    name: "Kabupaten Magelang",
    province: "Jawa Tengah",
    type: "Kabupaten",
  },
  {
    id: "purwokerto",
    name: "Purwokerto",
    province: "Jawa Tengah",
    type: "Kabupaten",
  },
  { id: "tegal", name: "Tegal", province: "Jawa Tengah", type: "Kota" },
  {
    id: "kab_tegal",
    name: "Kabupaten Tegal",
    province: "Jawa Tengah",
    type: "Kabupaten",
  },
  {
    id: "cilacap",
    name: "Cilacap",
    province: "Jawa Tengah",
    type: "Kabupaten",
  },
  { id: "kudus", name: "Kudus", province: "Jawa Tengah", type: "Kabupaten" },
  {
    id: "pekalongan",
    name: "Pekalongan",
    province: "Jawa Tengah",
    type: "Kota",
  },
  {
    id: "salatiga",
    name: "Salatiga",
    province: "Jawa Tengah",
    type: "Kota",
  },

  // DI Yogyakarta
  {
    id: "yogyakarta",
    name: "Yogyakarta",
    province: "DI Yogyakarta",
    type: "Kota",
  },
  {
    id: "sleman",
    name: "Sleman",
    province: "DI Yogyakarta",
    type: "Kabupaten",
  },
  {
    id: "bantul",
    name: "Bantul",
    province: "DI Yogyakarta",
    type: "Kabupaten",
  },
  {
    id: "kulon_progo",
    name: "Kulon Progo",
    province: "DI Yogyakarta",
    type: "Kabupaten",
  },
  {
    id: "gunung_kidul",
    name: "Gunung Kidul",
    province: "DI Yogyakarta",
    type: "Kabupaten",
  },

  // Jawa Barat
  { id: "bandung", name: "Bandung", province: "Jawa Barat", type: "Kota" },
  {
    id: "kab_bandung",
    name: "Kabupaten Bandung",
    province: "Jawa Barat",
    type: "Kabupaten",
  },
  {
    id: "bandung_barat",
    name: "Bandung Barat",
    province: "Jawa Barat",
    type: "Kabupaten",
  },
  { id: "bogor", name: "Bogor", province: "Jawa Barat", type: "Kota" },
  {
    id: "kab_bogor",
    name: "Kabupaten Bogor",
    province: "Jawa Barat",
    type: "Kabupaten",
  },
  { id: "depok", name: "Depok", province: "Jawa Barat", type: "Kota" },
  { id: "bekasi", name: "Bekasi", province: "Jawa Barat", type: "Kota" },
  {
    id: "kab_bekasi",
    name: "Kabupaten Bekasi",
    province: "Jawa Barat",
    type: "Kabupaten",
  },
  { id: "cirebon", name: "Cirebon", province: "Jawa Barat", type: "Kota" },
  {
    id: "kab_cirebon",
    name: "Kabupaten Cirebon",
    province: "Jawa Barat",
    type: "Kabupaten",
  },
  { id: "sukabumi", name: "Sukabumi", province: "Jawa Barat", type: "Kota" },
  {
    id: "kab_sukabumi",
    name: "Kabupaten Sukabumi",
    province: "Jawa Barat",
    type: "Kabupaten",
  },
  {
    id: "tasikmalaya",
    name: "Tasikmalaya",
    province: "Jawa Barat",
    type: "Kota",
  },
  {
    id: "kab_tasikmalaya",
    name: "Kabupaten Tasikmalaya",
    province: "Jawa Barat",
    type: "Kabupaten",
  },

  // Banten
  { id: "tangerang", name: "Tangerang", province: "Banten", type: "Kota" },
  {
    id: "tangerang_selatan",
    name: "Tangerang Selatan",
    province: "Banten",
    type: "Kota",
  },
  {
    id: "kab_tangerang",
    name: "Kabupaten Tangerang",
    province: "Banten",
    type: "Kabupaten",
  },
  { id: "serang", name: "Serang", province: "Banten", type: "Kota" },
  {
    id: "kab_serang",
    name: "Kabupaten Serang",
    province: "Banten",
    type: "Kabupaten",
  },
  { id: "cilegon", name: "Cilegon", province: "Banten", type: "Kota" },
  {
    id: "pandeglang",
    name: "Pandeglang",
    province: "Banten",
    type: "Kabupaten",
  },
  {
    id: "lebak",
    name: "Lebak",
    province: "Banten",
    type: "Kabupaten",
  },

  // DKI Jakarta
  {
    id: "jakarta_pusat",
    name: "Jakarta Pusat",
    province: "DKI Jakarta",
    type: "Kota",
  },
  {
    id: "jakarta_selatan",
    name: "Jakarta Selatan",
    province: "DKI Jakarta",
    type: "Kota",
  },
  {
    id: "jakarta_barat",
    name: "Jakarta Barat",
    province: "DKI Jakarta",
    type: "Kota",
  },
  {
    id: "jakarta_timur",
    name: "Jakarta Timur",
    province: "DKI Jakarta",
    type: "Kota",
  },
  {
    id: "jakarta_utara",
    name: "Jakarta Utara",
    province: "DKI Jakarta",
    type: "Kota",
  },
  {
    id: "kepulauan_seribu",
    name: "Kepulauan Seribu",
    province: "DKI Jakarta",
    type: "Kabupaten",
  },

  // Bali
  { id: "denpasar", name: "Denpasar", province: "Bali", type: "Kota" },
  { id: "badung", name: "Badung", province: "Bali", type: "Kabupaten" },
  { id: "gianyar", name: "Gianyar", province: "Bali", type: "Kabupaten" },
  { id: "tabanan", name: "Tabanan", province: "Bali", type: "Kabupaten" },
  { id: "buleleng", name: "Buleleng", province: "Bali", type: "Kabupaten" },
  { id: "karangasem", name: "Karangasem", province: "Bali", type: "Kabupaten" },

  // Kalimantan Timur
  {
    id: "balikpapan",
    name: "Balikpapan",
    province: "Kalimantan Timur",
    type: "Kota",
  },
  {
    id: "samarinda",
    name: "Samarinda",
    province: "Kalimantan Timur",
    type: "Kota",
  },
  {
    id: "bontang",
    name: "Bontang",
    province: "Kalimantan Timur",
    type: "Kota",
  },

  // Kalimantan Selatan
  {
    id: "banjarmasin",
    name: "Banjarmasin",
    province: "Kalimantan Selatan",
    type: "Kota",
  },
  {
    id: "banjarbaru",
    name: "Banjarbaru",
    province: "Kalimantan Selatan",
    type: "Kota",
  },

  // Kalimantan Barat
  {
    id: "pontianak",
    name: "Pontianak",
    province: "Kalimantan Barat",
    type: "Kota",
  },
  {
    id: "singkawang",
    name: "Singkawang",
    province: "Kalimantan Barat",
    type: "Kota",
  },

  // Kalimantan Tengah
  {
    id: "palangkaraya",
    name: "Palangka Raya",
    province: "Kalimantan Tengah",
    type: "Kota",
  },

  // Kalimantan Utara
  {
    id: "tarakan",
    name: "Tarakan",
    province: "Kalimantan Utara",
    type: "Kota",
  },

  // Sulawesi Selatan
  {
    id: "makassar",
    name: "Makassar",
    province: "Sulawesi Selatan",
    type: "Kota",
  },
  {
    id: "pare_pare",
    name: "Pare-Pare",
    province: "Sulawesi Selatan",
    type: "Kota",
  },
  {
    id: "palopo",
    name: "Palopo",
    province: "Sulawesi Selatan",
    type: "Kota",
  },

  // Sulawesi Utara
  {
    id: "manado",
    name: "Manado",
    province: "Sulawesi Utara",
    type: "Kota",
  },
  {
    id: "bitung",
    name: "Bitung",
    province: "Sulawesi Utara",
    type: "Kota",
  },
  {
    id: "tomohon",
    name: "Tomohon",
    province: "Sulawesi Utara",
    type: "Kota",
  },

  // Sulawesi Tengah
  { id: "palu", name: "Palu", province: "Sulawesi Tengah", type: "Kota" },

  // Sulawesi Tenggara
  {
    id: "kendari",
    name: "Kendari",
    province: "Sulawesi Tenggara",
    type: "Kota",
  },
  {
    id: "bau_bau",
    name: "Bau-Bau",
    province: "Sulawesi Tenggara",
    type: "Kota",
  },

  // Gorontalo
  {
    id: "gorontalo",
    name: "Gorontalo",
    province: "Gorontalo",
    type: "Kota",
  },

  // Sumatera Utara
  {
    id: "medan",
    name: "Medan",
    province: "Sumatera Utara",
    type: "Kota",
  },
  {
    id: "binjai",
    name: "Binjai",
    province: "Sumatera Utara",
    type: "Kota",
  },
  {
    id: "pematangsiantar",
    name: "Pematangsiantar",
    province: "Sumatera Utara",
    type: "Kota",
  },

  // Sumatera Selatan
  {
    id: "palembang",
    name: "Palembang",
    province: "Sumatera Selatan",
    type: "Kota",
  },
  {
    id: "prabumulih",
    name: "Prabumulih",
    province: "Sumatera Selatan",
    type: "Kota",
  },

  // Riau
  { id: "pekanbaru", name: "Pekanbaru", province: "Riau", type: "Kota" },
  { id: "dumai", name: "Dumai", province: "Riau", type: "Kota" },

  // Kepulauan Riau
  {
    id: "batam",
    name: "Batam",
    province: "Kepulauan Riau",
    type: "Kota",
  },
  {
    id: "tanjung_pinang",
    name: "Tanjung Pinang",
    province: "Kepulauan Riau",
    type: "Kota",
  },

  // Lampung
  {
    id: "lampung",
    name: "Bandar Lampung",
    province: "Lampung",
    type: "Kota",
  },
  { id: "metro", name: "Metro", province: "Lampung", type: "Kota" },

  // Sumatera Barat
  {
    id: "padang",
    name: "Padang",
    province: "Sumatera Barat",
    type: "Kota",
  },
  {
    id: "bukittinggi",
    name: "Bukittinggi",
    province: "Sumatera Barat",
    type: "Kota",
  },
  {
    id: "padang_panjang",
    name: "Padang Panjang",
    province: "Sumatera Barat",
    type: "Kota",
  },

  // Jambi
  { id: "jambi", name: "Jambi", province: "Jambi", type: "Kota" },
  { id: "sungai_penuh", name: "Sungai Penuh", province: "Jambi", type: "Kota" },

  // Bengkulu
  { id: "bengkulu", name: "Bengkulu", province: "Bengkulu", type: "Kota" },

  // Aceh
  {
    id: "banda_aceh",
    name: "Banda Aceh",
    province: "Aceh",
    type: "Kota",
  },
  {
    id: "lhokseumawe",
    name: "Lhokseumawe",
    province: "Aceh",
    type: "Kota",
  },
  {
    id: "langsa",
    name: "Langsa",
    province: "Aceh",
    type: "Kota",
  },
];

// Base rates per kg dari Surabaya (Estimasi Logistik Reguler)
const BASE_RATES_PER_KG: { [cityId: string]: number } = {
  // Jawa Timur
  surabaya: 5000,
  sidoarjo: 6000,
  gresik: 7000,
  mojokerto: 8000,
  pasuruan: 9000,
  malang: 10000,
  probolinggo: 12000,
  kediri: 12000,
  madiun: 13000,
  jember: 15000,
  tuban: 14000,
  banyuwangi: 18000,

  // Jawa Tengah & DIY
  semarang: 15000,
  solo: 13000,
  yogyakarta: 14000,
  magelang: 15000,
  kudus: 16000,
  purwokerto: 17000,
  tegal: 18000,
  cilacap: 19000,

  // Jawa Barat, Banten & Jakarta
  jakarta_pusat: 20000,
  jakarta_selatan: 20000,
  jakarta_barat: 20000,
  jakarta_timur: 20000,
  jakarta_utara: 20000,
  bekasi: 21000,
  depok: 21000,
  bogor: 21000,
  tangerang: 21000,
  bandung: 19000,
  cirebon: 17000,
  tasikmalaya: 22000,
  serang: 23000,

  // Bali & Nusa Tenggara
  denpasar: 18000,
  gianyar: 20000,
  mataram: 22000,
  kupang: 45000,

  // Kalimantan
  banjarmasin: 30000,
  balikpapan: 32000,
  samarinda: 35000,
  pontianak: 38000,
  palangkaraya: 36000,
  tarakan: 48000,

  // Sulawesi
  makassar: 35000,
  manado: 50000,
  palu: 45000,
  kendari: 48000,
  gorontalo: 52000,

  // Sumatera
  lampung: 28000,
  palembang: 32000,
  jambi: 35000,
  pekanbaru: 38000,
  padang: 40000,
  medan: 45000,
  aceh: 55000,
  batam: 42000,
  bengkulu: 38000,

  // Maluku & Papua
  ambon: 65000,
  ternate: 70000,
  jayapura: 95000,
  sorong: 90000,
  merauke: 110000,
};

/**
 * Calculate shipping cost based on weight and destination
 */
export function calculateShippingCost(
  destinationId: string,
  weightInGrams: number,
  courier: string
): ShippingRate[] {
  const baseRate = BASE_RATES_PER_KG[destinationId.toLowerCase()] || 20000;
  const weightInKg = weightInGrams / 1000;

  // Minimum 1kg untuk perhitungan
  const chargeableWeight = Math.max(1, Math.ceil(weightInKg));

  const baseCost = baseRate * chargeableWeight;

  // Different courier services with different pricing
  const rates: { [key: string]: ShippingRate[] } = {
    jne: [
      {
        service: "REG",
        description: "Layanan Reguler",
        cost: Math.round(baseCost * 1.0),
        etd: "2-3",
      },
      {
        service: "YES",
        description: "Yakin Esok Sampai",
        cost: Math.round(baseCost * 1.5),
        etd: "1-1",
      },
      {
        service: "OKE",
        description: "Ongkos Kirim Ekonomis",
        cost: Math.round(baseCost * 0.8),
        etd: "3-5",
      },
    ],
    jnt: [
      {
        service: "EZ",
        description: "Ekonomis",
        cost: Math.round(baseCost * 0.75),
        etd: "3-5",
      },
      {
        service: "REG",
        description: "Reguler",
        cost: Math.round(baseCost * 0.95),
        etd: "2-3",
      },
    ],
    sicepat: [
      {
        service: "REG",
        description: "Reguler",
        cost: Math.round(baseCost * 0.9),
        etd: "2-3",
      },
      {
        service: "BEST",
        description: "Best",
        cost: Math.round(baseCost * 1.2),
        etd: "1-2",
      },
      {
        service: "HALU",
        description: "Halu",
        cost: Math.round(baseCost * 0.7),
        etd: "4-6",
      },
    ],
    anteraja: [
      {
        service: "REG",
        description: "Reguler",
        cost: Math.round(baseCost * 0.85),
        etd: "2-4",
      },
      {
        service: "NEXT",
        description: "Next Day",
        cost: Math.round(baseCost * 1.3),
        etd: "1-1",
      },
    ],
    ninja: [
      {
        service: "REG",
        description: "Reguler",
        cost: Math.round(baseCost * 0.88),
        etd: "2-3",
      },
      {
        service: "INSTANT",
        description: "Instant",
        cost: Math.round(baseCost * 1.4),
        etd: "1-1",
      },
    ],
    idexpress: [
      {
        service: "REG",
        description: "Reguler",
        cost: Math.round(baseCost * 0.92),
        etd: "2-4",
      },
      {
        service: "CARGO",
        description: "Cargo",
        cost: Math.round(baseCost * 0.65),
        etd: "5-7",
      },
    ],
  };

  return rates[courier.toLowerCase()] || rates.jne;
}

/**
 * Get all available cities
 */
export function getCities(): City[] {
  return CITIES;
}

/**
 * Find city by name (case insensitive, partial match)
 */
export function findCityByName(cityName: string): City | undefined {
  const searchTerm = cityName.toLowerCase().trim();
  return CITIES.find(
    (city) =>
      city.name.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(city.name.toLowerCase())
  );
}
