export interface Customer {
  id: string;
  tenKhachHang: string;
  soDienThoai: string;
  ghiChu: string;
  ngayTao: string; // YYYY-MM-DD
}

export interface RepairItem {
  id: string;
  maDonHang: string;
  khachHangId: string;
  tenKhachHang: string;
  soDienThoai: string;
  tenMay: string;
  matHangThay: string;
  soTien: number;
  ngayThay: string; // YYYY-MM-DD
  baoHanhThang: number;
  ngayHetBaoHanh: string; // YYYY-MM-DD or '' if 0 months
  ghiChu: string;
}

export interface RepairOrder {
  maDonHang: string;
  khachHangId: string;
  tenKhachHang: string;
  soDienThoai: string;
  tenMay: string;
  ngayThay: string;
  items: RepairItem[];
  tongTien: number;
}

export type WarrantyStatus = 'active' | 'expiring' | 'expired' | 'none';

export interface WarrantyInfo {
  status: WarrantyStatus;
  daysRemaining: number | null;
  label: string;
}

export interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  website: string;
  warrantyNote: string;
}

export interface AppSettings {
  mode: 'local' | 'sheets';
  webAppUrl: string;
  secretKey: string;
  shopInfo: ShopInfo;
}

export interface AppDataset {
  customers: Customer[];
  items: RepairItem[];
}
