import fs from 'fs';
import path from 'path';

// Interfaces
interface Province {
  id: string;
  name: string;
}

interface Regency {
  id: string;
  provinceId: string;
  name: string;
}

interface District {
  id: string;
  regencyId: string;
  name: string;
}

// Base Costs Mapping (Province ID -> Cost per KG)
const PROVINCE_BASE_COSTS: Record<string, number> = {
  "11": 55000, // ACEH
  "12": 40000, // SUMATERA UTARA
  "13": 35000, // SUMATERA BARAT
  "14": 35000, // RIAU
  "15": 35000, // JAMBI
  "16": 30000, // SUMATERA SELATAN
  "17": 40000, // BENGKULU
  "18": 30000, // LAMPUNG
  "19": 40000, // KEPULAUAN BANGKA BELITUNG
  "21": 40000, // KEPULAUAN RIAU
  "31": 10000, // DKI JAKARTA
  "32": 15000, // JAWA BARAT
  "33": 20000, // JAWA TENGAH
  "34": 20000, // DI YOGYAKARTA
  "35": 25000, // JAWA TIMUR
  "36": 15000, // BANTEN
  "51": 35000, // BALI
  "52": 40000, // NUSA TENGGARA BARAT
  "53": 50000, // NUSA TENGGARA TIMUR
  "61": 45000, // KALIMANTAN BARAT
  "62": 45000, // KALIMANTAN TENGAH
  "63": 45000, // KALIMANTAN SELATAN
  "64": 50000, // KALIMANTAN TIMUR
  "65": 55000, // KALIMANTAN UTARA
  "71": 55000, // SULAWESI UTARA
  "72": 50000, // SULAWESI TENGAH
  "73": 45000, // SULAWESI SELATAN
  "74": 55000, // SULAWESI TENGGARA
  "75": 50000, // GORONTALO
  "76": 50000, // SULAWESI BARAT
  "81": 80000, // MALUKU
  "82": 85000, // MALUKU UTARA
  "91": 100000, // PAPUA BARAT
  "94": 100000, // PAPUA
};

// Data Cache
let provincesCache: Province[] = [];
let regenciesCache: Regency[] = [];
let districtsCache: District[] = [];

// Helper to read CSV
const readCsv = (filename: string): string[][] => {
  const filePath = path.join(__dirname, '../database/data', filename);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.split(','));
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

// Load Data
const loadData = () => {
  if (provincesCache.length > 0) return; // Already loaded

  // Load Provinces
  const provincesData = readCsv('provinces.csv');
  provincesCache = provincesData.map(row => ({
    id: row[0],
    name: row[1]
  }));

  // Load Regencies
  const regenciesData = readCsv('regencies.csv');
  regenciesCache = regenciesData.map(row => ({
    id: row[0],
    provinceId: row[1],
    name: row[2]
  }));

  // Load Districts
  const districtsData = readCsv('districts.csv');
  districtsCache = districtsData.map(row => ({
    id: row[0],
    regencyId: row[1],
    name: row[2]
  }));
  
  console.log(`Loaded ${provincesCache.length} provinces, ${regenciesCache.length} regencies, ${districtsCache.length} districts.`);
};

// Initialize data loading
loadData();

export const getProvinces = () => {
  return provincesCache;
};

export const getRegencies = (provinceId: string) => {
  return regenciesCache.filter(r => r.provinceId === provinceId);
};

export const getDistricts = (regencyId: string) => {
  return districtsCache.filter(d => d.regencyId === regencyId);
};

export const getProvinceIdByName = (name: string): string | undefined => {
  const province = provincesCache.find(p => p.name.toLowerCase() === name.toLowerCase());
  return province?.id;
};

export const calculateShippingCost = (provinceIdOrName: string, weight: number) => {
  let provinceId = provinceIdOrName;

  // Check if input is likely a name (not numeric string) or not in cost map
  if (!PROVINCE_BASE_COSTS[provinceId]) {
    const foundId = getProvinceIdByName(provinceIdOrName);
    if (foundId) {
      provinceId = foundId;
    }
  }

  const baseCost = PROVINCE_BASE_COSTS[provinceId];
  
  if (!baseCost) {
    // Default cost if province not found in mapping (fallback)
    return 50000 * Math.ceil(weight); 
  }
  
  const roundedWeight = Math.ceil(weight);
  const finalWeight = roundedWeight < 1 ? 1 : roundedWeight;
  
  return baseCost * finalWeight;
};
