// Mock data for AN NGUYEN PHAT CRM
const MOCK_ROW_COUNT = 10;

export type Customer = {
  MA_KH: string;
  MA_THONG_KE: string;
  ten: string;
  mst: string;
  diaChi: string;
  nguoiLienHe: string;
  dienThoai: string;
  email: string;
  ghiChu: string;
};

export type Supplier = {
  MA_NCC: string;
  ten: string;
  mst: string;
  diaChi: string;
  nguoiLienHe: string;
  dienThoai: string;
  email: string;
  ghiChu: string;
};

export type Shipper = {
  MA_VC: string;
  ten: string;
  mst: string;
  nguoiLienHe: string;
  dienThoai: string;
  bienSo: string;
  ghiChu: string;
};

export type Product = {
  MA_SP: string;
  ten: string;
  dvt: string;
  vat: number;
};

export type ExpenseType = { MA_LOAI_CP: string; ten: string };

export type Sale = {
  MA_CHUNG_TU: string;
  ngay: string;
  MA_THONG_KE: string;
  khachHang: string;
  maSP: string;
  soLuong: number;
  donGia: number;
  giaTriBan: number;
  vat: number;
  tienVat: number;
  tongTT: number;
  congJumbo: number;
  truJumbo: number;
  hoaHong: number;
  dienGiai: string;
  ngayHD: string;
  soHD: string;
  trangThai: "Đã thanh toán" | "Còn nợ" | "Quá hạn";
};

export type Purchase = {
  MA_CHUNG_TU: string;
  ngay: string;
  MA_THONG_KE: string;
  ncc: string;
  maSP: string;
  soLuong: number;
  donGia: number;
  giaTriMua: number;
  vat: number;
  congJumbo: number;
  truJumbo: number;
  ghiChu: string;
  ngayHD: string;
  soHD: string;
};

export type Shipping = {
  MA_CHUNG_TU: string;
  ngay: string;
  MA_THONG_KE: string;
  dvvc: string;
  bienSo: string;
  maSP: string;
  soLuong: number;
  donGia: number;
  giaTriVC: number;
  vat: number;
  ghiChu: string;
  ngayHD: string;
  soHD: string;
};

export type Expense = {
  MA_CHI_PHI: string;
  ngay: string;
  loaiCP: string;
  doiTuong: string;
  MA_CHUNG_TU: string;
  MA_THONG_KE: string;
  lyDo: string;
  soTien: number;
  ghiChu: string;
};

// ===== Customers =====
const cusBase = [
  ["KH_FM", "TK_FM", "Công ty TNHH FM"],
  ["KH_VM", "TK_VM", "Công ty TNHH VM"],
  ["KH_HA", "TK_HA", "Công ty TNHH Hải An"],
  ["KH_TD", "TK_TD", "Công ty Thành Đạt"],
  ["KH_HP", "TK_HP", "Công ty Hải Phát"],
  ["KH_TN", "TK_TN", "Công ty Tân Nguyên"],
  ["KH_DL", "TK_DL", "Công ty Đại Lộc"],
  ["KH_MK", "TK_MK", "Công ty Minh Khánh"],
  ["KH_PT", "TK_PT", "Công ty Phú Thịnh"],
  ["KH_AN", "TK_AN", "Công ty An Nhiên"],
  ["KH_BL", "TK_BL", "Công ty Bảo Long"],
  ["KH_CT", "TK_CT", "Công ty Cát Tường"],
  ["KH_DN", "TK_DN", "Công ty Đông Nam"],
  ["KH_HT", "TK_HT", "Công ty Hưng Thịnh"],
  ["KH_KL", "TK_KL", "Công ty Kim Long"],
  ["KH_LV", "TK_LV", "Công ty Lộc Vượng"],
  ["KH_NA", "TK_NA", "Công ty Nam Á"],
  ["KH_QH", "TK_QH", "Công ty Quang Huy"],
  ["KH_SG", "TK_SG", "Công ty Sài Gòn Mới"],
  ["KH_VL", "TK_VL", "Công ty Vĩnh Long"],
];
const cities = ["Hà Nội", "TP. HCM", "Hải Phòng", "Đà Nẵng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Bắc Ninh"];
const names = ["Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Nam", "Phạm Minh Tuấn", "Hoàng Thu Hà", "Đỗ Quốc Việt", "Vũ Thanh Sơn", "Bùi Phương Thảo"];

export const customers: Customer[] = cusBase.slice(0, MOCK_ROW_COUNT).map(([MA_KH, MA_THONG_KE, ten], i) => ({
  MA_KH,
  MA_THONG_KE,
  ten,
  mst: `0${100000000 + i * 137}`,
  diaChi: `${10 + i} Đường Lê Lợi, ${cities[i % cities.length]}`,
  nguoiLienHe: names[i % names.length],
  dienThoai: `09${String(10000000 + i * 731923).slice(0, 8)}`,
  email: `info@${MA_KH.toLowerCase()}.vn`,
  ghiChu: i % 3 === 0 ? "Khách VIP" : "",
}));

// ===== Suppliers =====
const sBase = [
  ["NCC_HIEU", "Công ty CP Hiếu Phát"],
  ["NCC_MINH", "Công ty Minh Quân"],
  ["NCC_AN", "Công ty An Bình"],
  ["NCC_PHAT", "Công ty Phát Đạt"],
  ["NCC_HOANG", "Công ty Hoàng Gia"],
  ["NCC_TUAN", "Công ty Tuấn Anh"],
  ["NCC_LINH", "Công ty Linh Chi"],
  ["NCC_DUY", "Công ty Duy Tân"],
  ["NCC_BAO", "Công ty Bảo Tín"],
  ["NCC_LAN", "Công ty Lan Anh"],
  ["NCC_KHANH", "Công ty Khánh Nam"],
  ["NCC_THINH", "Công ty Thịnh Phát"],
  ["NCC_VINH", "Công ty Vĩnh Tiến"],
  ["NCC_TRUNG", "Công ty Trung Thành"],
  ["NCC_SON", "Công ty Sơn Hà"],
];
export const suppliers: Supplier[] = sBase.slice(0, MOCK_ROW_COUNT).map(([MA_NCC, ten], i) => ({
  MA_NCC,
  ten,
  mst: `0${200000000 + i * 217}`,
  diaChi: `KCN ${cities[i % cities.length]}, Lô ${i + 1}`,
  nguoiLienHe: names[(i + 2) % names.length],
  dienThoai: `09${String(20000000 + i * 511723).slice(0, 8)}`,
  email: `sales@${MA_NCC.toLowerCase()}.vn`,
  ghiChu: i % 4 === 0 ? "NCC chiến lược" : "",
}));

// ===== Shippers =====
const shBase = [
  ["VC_TU", "Vận tải Tuấn Anh"],
  ["VC_HOANG", "Vận tải Hoàng Long"],
  ["VC_MINH", "Vận tải Minh Đức"],
  ["VC_VIET", "Vận tải Việt Thắng"],
  ["VC_LONG", "Vận tải Long Phát"],
  ["VC_SON", "Vận tải Sơn Tùng"],
  ["VC_HAI", "Vận tải Hải Đăng"],
  ["VC_NAM", "Vận tải Nam Việt"],
  ["VC_TIEN", "Vận tải Tiến Phát"],
  ["VC_BINH", "Vận tải Bình An"],
  ["VC_TAM", "Vận tải Tâm Đức"],
  ["VC_KHA", "Vận tải Khả Năng"],
  ["VC_DAT", "Vận tải Đắt Lộc"],
  ["VC_TRI", "Vận tải Trí Đức"],
  ["VC_QUY", "Vận tải Quý Bảo"],
];
export const shippers: Shipper[] = shBase.slice(0, MOCK_ROW_COUNT).map(([MA_VC, ten], i) => ({
  MA_VC,
  ten,
  mst: `0${300000000 + i * 313}`,
  nguoiLienHe: names[(i + 1) % names.length],
  dienThoai: `09${String(30000000 + i * 411723).slice(0, 8)}`,
  bienSo: `${29 + (i % 10)}C-${String(10000 + i * 333).slice(0, 5)}`,
  ghiChu: "",
}));

// ===== Products =====
const prodBase = [
  ["CB", "Cám bắp", "kg", 8],
  ["VNG", "Vỏ ngô", "kg", 5],
  ["VNT", "Vỏ ngũ thực", "kg", 5],
  ["BT", "Bột thịt", "kg", 8],
  ["HC", "Hèm cà phê", "kg", 5],
  ["BCN", "Bánh cà phê nâu", "kg", 5],
  ["KKN", "Khô khoai nghiền", "kg", 8],
  ["CT", "Cám trộn", "kg", 8],
  ["MN", "Mì nghiền", "kg", 5],
  ["DDN", "Đậu nành nghiền", "kg", 8],
  ["BMI", "Bã mía", "kg", 5],
  ["BSC", "Bã sắn", "kg", 5],
  ["KSO", "Khô sồi", "kg", 8],
  ["KDN", "Khô đậu nành", "kg", 8],
  ["BDA", "Bột đá", "kg", 5],
  ["BCC", "Bánh chè cám", "kg", 5],
  ["VCA", "Vỏ cà phê", "kg", 5],
  ["XDA", "Xơ dừa", "kg", 5],
  ["BTM", "Bã tỏi mật", "kg", 8],
  ["CGA", "Cám gạo", "kg", 5],
  ["DDP", "Đậu phộng vỏ", "kg", 8],
  ["KMI", "Khoai mì lát", "kg", 5],
  ["CBA", "Cám bắp ép", "kg", 8],
  ["RTU", "Rỉ mật tươi", "lít", 8],
  ["LNC", "Lúa nghiền", "kg", 5],
  ["SAN", "Sắn lát", "kg", 5],
  ["TMI", "Trấu mịn", "kg", 5],
  ["BME", "Bã men bia", "kg", 5],
  ["XCA", "Xác cà phê", "kg", 5],
  ["DDU", "Dầu thực vật", "lít", 10],
];
export const products: Product[] = prodBase.slice(0, MOCK_ROW_COUNT).map(([MA_SP, ten, dvt, vat]) => ({
  MA_SP: MA_SP as string,
  ten: ten as string,
  dvt: dvt as string,
  vat: vat as number,
}));

// ===== Expense Types =====
export const expenseTypes: ExpenseType[] = [
  { MA_LOAI_CP: "CP_BANHANG", ten: "Chi phí bán hàng" },
  { MA_LOAI_CP: "CP_BOCXEP", ten: "Chi phí bốc xếp" },
  { MA_LOAI_CP: "CP_LO", ten: "Chi phí cho lò" },
  { MA_LOAI_CP: "CP_CANXE", ten: "Chi phí cân xe" },
  { MA_LOAI_CP: "CP_QLDN", ten: "Chi phí quản lý doanh nghiệp" },
  { MA_LOAI_CP: "CP_TAICHINH", ten: "Chi phí tài chính" },
  { MA_LOAI_CP: "CP_KHAC", ten: "Chi phí khác" },
  { MA_LOAI_CP: "GV_HANGBAN", ten: "Giá vốn hàng bán" },
];

// ===== Deterministic PRNG =====
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pad(n: number, w: number) {
  return String(n).padStart(w, "0");
}

function dateStr(base: number, offset: number) {
  const d = new Date(2025, 0, 1 + Math.floor(offset));
  return d.toISOString().slice(0, 10);
}

function jumboPair(r: () => number, maxCong: number, maxTru: number) {
  return r() > 0.5
    ? { congJumbo: Math.floor(r() * maxCong) * 5000, truJumbo: 0 }
    : { congJumbo: 0, truJumbo: Math.floor(r() * maxTru) * 5000 };
}

// ===== Sales =====
export const sales: Sale[] = (() => {
  const r = rng(7);
  const arr: Sale[] = [];
  for (let i = 0; i < MOCK_ROW_COUNT; i++) {
    const cus = customers[Math.floor(r() * customers.length)];
    const p = products[Math.floor(r() * products.length)];
    const sl = Math.floor(r() * 25000) + 1000;
    const dg = Math.floor(r() * 5000) + 2500;
    const gt = sl * dg;
    const tienVat = Math.round((gt * p.vat) / 100);
    const jumbo = jumboPair(r, 200, 100);
    const hh = Math.floor(r() * 500000);
    const status = r();
    arr.push({
      MA_CHUNG_TU: `BAN${pad(i + 1, 6)}`,
      ngay: dateStr(0, (i * 3) % 320),
      MA_THONG_KE: cus.MA_THONG_KE,
      khachHang: cus.ten,
      maSP: p.MA_SP,
      soLuong: sl,
      donGia: dg,
      giaTriBan: gt,
      vat: p.vat,
      tienVat,
      tongTT: gt + tienVat + jumbo.congJumbo - jumbo.truJumbo,
      congJumbo: jumbo.congJumbo,
      truJumbo: jumbo.truJumbo,
      hoaHong: hh,
      dienGiai: `Bán ${p.ten} cho ${cus.ten}`,
      ngayHD: dateStr(0, ((i * 3) % 320) + 2),
      soHD: `0000${pad(i + 1, 4)}`,
      trangThai: status > 0.7 ? "Đã thanh toán" : status > 0.3 ? "Còn nợ" : "Quá hạn",
    });
  }
  return arr;
})();

// ===== Purchases =====
export const purchases: Purchase[] = (() => {
  const r = rng(13);
  const arr: Purchase[] = [];
  for (let i = 0; i < MOCK_ROW_COUNT; i++) {
    const s = suppliers[Math.floor(r() * suppliers.length)];
    const p = products[Math.floor(r() * products.length)];
    const sl = Math.floor(r() * 25000) + 1000;
    const dg = Math.floor(r() * 4500) + 2000;
    const cus = customers[Math.floor(r() * customers.length)];
    const jumbo = jumboPair(r, 150, 80);
    arr.push({
      MA_CHUNG_TU: `MUA${pad(i + 1, 6)}`,
      ngay: dateStr(0, (i * 3) % 320),
      MA_THONG_KE: cus.MA_THONG_KE,
      ncc: s.ten,
      maSP: p.MA_SP,
      soLuong: sl,
      donGia: dg,
      giaTriMua: sl * dg,
      vat: p.vat,
      congJumbo: jumbo.congJumbo,
      truJumbo: jumbo.truJumbo,
      ghiChu: i % 5 === 0 ? "Mua gấp" : "",
      ngayHD: dateStr(0, ((i * 3) % 320) + 1),
      soHD: `1000${pad(i + 1, 4)}`,
    });
  }
  return arr;
})();

// ===== Shipping =====
export const shippings: Shipping[] = (() => {
  const r = rng(19);
  const arr: Shipping[] = [];
  for (let i = 0; i < MOCK_ROW_COUNT; i++) {
    const sh = shippers[Math.floor(r() * shippers.length)];
    const p = products[Math.floor(r() * products.length)];
    const sl = Math.floor(r() * 25000) + 1000;
    const dg = Math.floor(r() * 400) + 150;
    const cus = customers[Math.floor(r() * customers.length)];
    arr.push({
      MA_CHUNG_TU: `VC${pad(i + 1, 6)}`,
      ngay: dateStr(0, (i * 4) % 320),
      MA_THONG_KE: cus.MA_THONG_KE,
      dvvc: sh.ten,
      bienSo: sh.bienSo,
      maSP: p.MA_SP,
      soLuong: sl,
      donGia: dg,
      giaTriVC: sl * dg,
      vat: 8,
      ghiChu: "",
      ngayHD: dateStr(0, ((i * 4) % 320) + 1),
      soHD: `2000${pad(i + 1, 4)}`,
    });
  }
  return arr;
})();

// ===== Expenses =====
export const expenses: Expense[] = (() => {
  const r = rng(23);
  const arr: Expense[] = [];
  const reasons = ["Thanh toán cước", "Bốc xếp hàng", "Thuê kho", "Hoa hồng môi giới", "Đổ xăng xe tải", "Tiền điện kho", "Chi linh tinh"];
  for (let i = 0; i < MOCK_ROW_COUNT; i++) {
    const t = expenseTypes[i % expenseTypes.length];
    const cus = customers[Math.floor(r() * customers.length)];
    const refType = Math.floor(r() * 3);
    const ref =
      refType === 0
        ? sales[Math.floor(r() * sales.length)].MA_CHUNG_TU
        : refType === 1
          ? purchases[Math.floor(r() * purchases.length)].MA_CHUNG_TU
          : shippings[Math.floor(r() * shippings.length)].MA_CHUNG_TU;
    arr.push({
      MA_CHI_PHI: `CP${pad(i + 1, 7)}`,
      ngay: dateStr(0, (i * 2) % 320),
      loaiCP: t.ten,
      doiTuong: refType === 2 ? shippers[i % shippers.length].ten : refType === 1 ? suppliers[i % suppliers.length].ten : cus.ten,
      MA_CHUNG_TU: ref,
      MA_THONG_KE: cus.MA_THONG_KE,
      lyDo: reasons[i % reasons.length],
      soTien: (Math.floor(r() * 950) + 50) * 10000,
      ghiChu: "",
    });
  }
  return arr;
})();

export function fmtVND(n?: number | string | null) {
  const value = typeof n === "number" ? n : Number(n ?? 0);
  return (Number.isFinite(value) ? value : 0).toLocaleString("vi-VN");
}

export function fmtDate(s: string) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
