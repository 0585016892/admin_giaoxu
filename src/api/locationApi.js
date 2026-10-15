import axios from "axios";

const LOCATION_BASE_URL = "https://provinces.open-api.vn/api/v2";

// Cache dữ liệu trong bộ nhớ để hạn chế gọi API lặp lại
let provincesCache = null;
const communesCache = new Map();

const locationClient = axios.create({
  baseURL: LOCATION_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Lấy danh sách tỉnh/thành phố theo địa giới mới.
 */
export const getProvinces = async ({ forceRefresh = false } = {}) => {
  if (provincesCache && !forceRefresh) {
    return provincesCache;
  }

  try {
    console.info("[Location API] Đang tải danh sách tỉnh/thành phố...");

    const response = await locationClient.get("/p/");

    if (!Array.isArray(response.data)) {
      throw new Error("API tỉnh/thành phố trả về dữ liệu không hợp lệ");
    }

    provincesCache = response.data
      .map((item) => ({
        code: item.code,
        name: item.name,
        codename: item.codename,
        division_type: item.division_type,
        phone_code: item.phone_code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));

    console.info(
      `[Location API] Đã tải ${provincesCache.length} tỉnh/thành phố`,
    );

    return provincesCache;
  } catch (error) {
    console.error(
      "[Location API] Lỗi tải tỉnh/thành phố:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Lấy danh sách xã/phường theo mã tỉnh.
 */
export const getCommunes = async (
  provinceCode,
  { forceRefresh = false } = {},
) => {
  if (!provinceCode) return [];

  const key = String(provinceCode);

  if (communesCache.has(key) && !forceRefresh) {
    return communesCache.get(key);
  }

  try {
    console.info(`[Location API] Đang tải xã/phường của tỉnh có mã ${key}...`);

    const response = await locationClient.get("/w/", {
      params: {
        province: provinceCode,
      },
    });

    if (!Array.isArray(response.data)) {
      throw new Error("API xã/phường trả về dữ liệu không hợp lệ");
    }

    const communes = response.data
      .map((item) => ({
        code: item.code,
        name: item.name,
        codename: item.codename,
        division_type: item.division_type,
        province_code: item.province_code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));

    communesCache.set(key, communes);

    console.info(`[Location API] Đã tải ${communes.length} xã/phường`);

    return communes;
  } catch (error) {
    console.error(
      `[Location API] Lỗi tải xã/phường tỉnh ${key}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Xóa cache nếu muốn tải lại dữ liệu mới.
 */
export const clearLocationCache = () => {
  provincesCache = null;
  communesCache.clear();

  console.info("[Location API] Đã xóa cache địa giới hành chính");
};

const locationApi = {
  getProvinces,
  getCommunes,
  clearLocationCache,
};

export default locationApi;
