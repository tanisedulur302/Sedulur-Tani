/**
 * JWT Token Validation Utility
 * Mengecek apakah token JWT masih valid atau sudah expired
 */

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token tanpa verifikasi (client-side only)
 * CATATAN: Ini HANYA untuk mengecek expiry time, bukan untuk keamanan
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode payload (middle part) - use atob for browser compatibility
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

/**
 * Cek apakah token sudah expired
 * @param token - JWT token string
 * @returns boolean - true jika sudah expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true; // Anggap expired jika tidak bisa decode
    }

    // exp adalah dalam detik, kita ubah ke millisecond
    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();

    // Return true jika sudah lewat masa berlaku
    return currentTime >= expiryTime;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true; // Anggap expired untuk safety
  }
}

/**
 * Cek apakah token masih valid (belum expired)
 */
export function isTokenValid(token: string): boolean {
  return !isTokenExpired(token);
}

/**
 * Get remaining time (dalam detik) sebelum token expired
 */
export function getTokenRemainingTime(token: string): number {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }

    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const remainingTime = Math.max(
      0,
      Math.floor((expiryTime - currentTime) / 1000),
    );

    return remainingTime;
  } catch (error) {
    console.error("Error calculating remaining time:", error);
    return 0;
  }
}

/**
 * Validasi dan cleanup token yang expired
 * Menghapus token jika sudah expired
 */
export function validateAndCleanupToken(): boolean {
  const token = localStorage.getItem("token");

  if (!token) {
    return false; // Tidak ada token
  }

  if (isTokenExpired(token)) {
    // Token sudah expired, bersihkan
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("auth-changed"));
    return false;
  }

  return true; // Token masih valid
}

/**
 * Cek auth status user
 * Mengembalikan: "authenticated" | "expired" | "no-token"
 */
export function checkAuthStatus(): "authenticated" | "expired" | "no-token" {
  const token = localStorage.getItem("token");

  if (!token) {
    return "no-token";
  }

  if (isTokenExpired(token)) {
    return "expired";
  }

  return "authenticated";
}
