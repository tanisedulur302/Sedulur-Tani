import fs from "fs";
import path from "path";

interface Province {
  id: string;
  name: string;
}

interface Regency {
  id: string;
  province_id: string;
  name: string;
  type: "KOTA" | "KABUPATEN";
}

interface District {
  id: string;
  regency_id: string;
  name: string;
}

class LocationService {
  private provinces: Province[] = [];
  private regencies: Regency[] = [];
  private districts: District[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      // Load provinces
      const provincesPath = path.join(
        __dirname,
        "../database/data/provinces.csv"
      );
      const provincesData = fs.readFileSync(provincesPath, "utf-8");
      this.provinces = provincesData
        .trim()
        .split("\n")
        .map((line) => {
          const [id, name] = line.split(",");
          return { id, name };
        });

      // Load regencies
      const regenciesPath = path.join(
        __dirname,
        "../database/data/regencies.csv"
      );
      const regenciesData = fs.readFileSync(regenciesPath, "utf-8");
      this.regencies = regenciesData
        .trim()
        .split("\n")
        .map((line) => {
          const [id, province_id, ...nameParts] = line.split(",");
          const name = nameParts.join(","); // Handle names with commas
          const type = name.startsWith("KOTA") ? "KOTA" : "KABUPATEN";
          return { id, province_id, name, type };
        });

      // Load districts
      const districtsPath = path.join(
        __dirname,
        "../database/data/districts.csv"
      );
      const districtsData = fs.readFileSync(districtsPath, "utf-8");
      this.districts = districtsData
        .trim()
        .split("\n")
        .map((line) => {
          const [id, regency_id, ...nameParts] = line.split(",");
          const name = nameParts.join(",");
          return { id, regency_id, name };
        });

      console.log(
        `✅ Loaded ${this.provinces.length} provinces, ${this.regencies.length} regencies, ${this.districts.length} districts.`
      );
    } catch (error) {
      console.error("❌ Error loading location data:", error);
    }
  }

  getProvinces(): Province[] {
    return this.provinces;
  }

  getRegencies(provinceId?: string): Regency[] {
    if (provinceId) {
      return this.regencies.filter((r) => r.province_id === provinceId);
    }
    return this.regencies;
  }

  getDistricts(regencyId?: string): District[] {
    if (regencyId) {
      return this.districts.filter((d) => d.regency_id === regencyId);
    }
    return this.districts;
  }

  getProvinceById(id: string): Province | undefined {
    return this.provinces.find((p) => p.id === id);
  }

  getRegencyById(id: string): Regency | undefined {
    return this.regencies.find((r) => r.id === id);
  }

  getDistrictById(id: string): District | undefined {
    return this.districts.find((d) => d.id === id);
  }
}

export default new LocationService();
