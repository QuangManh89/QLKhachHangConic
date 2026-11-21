import type { AppDataset, AppSettings, Customer, RepairItem } from '../types';
import { calculateWarrantyEndDate, getTodayISO } from '../utils/warranty';

const SETTINGS_KEY = 'conic_settings_v1';
const LOCAL_DATA_KEY = 'conic_local_data_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  mode: 'local',
  webAppUrl: '',
  secretKey: 'CONIC_SECRET_2026',
  shopInfo: {
    name: 'ConicComputer',
    address: 'Liên hệ cập nhật địa chỉ trong Cài đặt',
    phone: '0900 000 000',
    website: 'coniccomputer.vn',
    warrantyNote:
      'Vui lòng giữ phiếu bảo hành hoặc đọc đúng số điện thoại khi đến bảo hành. Không áp dụng bảo hành đối với sản phẩm bị rơi vỡ, vào nước, cháy nổ hoặc rách tem bảo hành.',
  },
};

function createDemoDataset(): AppDataset {
  const today = getTodayISO();
  const tenDaysAgo = shiftDaysISO(today, -10);
  const fiveMonthsAgo = shiftDaysISO(today, -165);
  const fourteenMonthsAgo = shiftDaysISO(today, -420);

  const customers: Customer[] = [
    {
      id: 'KH-DEMO01',
      tenKhachHang: 'Nguyễn Minh Quân',
      soDienThoai: '0908123456',
      ghiChu: 'Khách quen — làm việc văn phòng',
      ngayTao: fiveMonthsAgo,
    },
    {
      id: 'KH-DEMO02',
      tenKhachHang: 'Trần Thị Thu Hà',
      soDienThoai: '0919654321',
      ghiChu: 'Sinh viên thiết kế đồ họa',
      ngayTao: tenDaysAgo,
    },
    {
      id: 'KH-DEMO03',
      tenKhachHang: 'Lê Hoàng Phúc',
      soDienThoai: '0987334455',
      ghiChu: 'Máy công ty',
      ngayTao: fourteenMonthsAgo,
    },
  ];

  const items: RepairItem[] = [
    {
      id: 'ITEM-DEMO01',
      maDonHang: 'DH-DEMO-001',
      khachHangId: 'KH-DEMO01',
      tenKhachHang: 'Nguyễn Minh Quân',
      soDienThoai: '0908123456',
      tenMay: 'Dell Latitude 7420',
      matHangThay: 'SSD NVMe Kingston 500GB',
      soTien: 1150000,
      ngayThay: tenDaysAgo,
      baoHanhThang: 36,
      ngayHetBaoHanh: calculateWarrantyEndDate(tenDaysAgo, 36),
      ghiChu: 'Tem BH #K500-221',
    },
    {
      id: 'ITEM-DEMO02',
      maDonHang: 'DH-DEMO-001',
      khachHangId: 'KH-DEMO01',
      tenKhachHang: 'Nguyễn Minh Quân',
      soDienThoai: '0908123456',
      tenMay: 'Dell Latitude 7420',
      matHangThay: 'Vệ sinh laptop + tra keo MX-4',
      soTien: 150000,
      ngayThay: tenDaysAgo,
      baoHanhThang: 1,
      ngayHetBaoHanh: calculateWarrantyEndDate(tenDaysAgo, 1),
      ghiChu: '',
    },
    {
      id: 'ITEM-DEMO03',
      maDonHang: 'DH-DEMO-002',
      khachHangId: 'KH-DEMO02',
      tenKhachHang: 'Trần Thị Thu Hà',
      soDienThoai: '0919654321',
      tenMay: 'Asus Vivobook Pro 15',
      matHangThay: 'Pin Laptop Asus Zin 63Wh',
      soTien: 950000,
      ngayThay: fiveMonthsAgo,
      baoHanhThang: 6,
      ngayHetBaoHanh: calculateWarrantyEndDate(fiveMonthsAgo, 6),
      ghiChu: 'Sắp hết hạn bảo hành',
    },
    {
      id: 'ITEM-DEMO04',
      maDonHang: 'DH-DEMO-003',
      khachHangId: 'KH-DEMO03',
      tenKhachHang: 'Lê Hoàng Phúc',
      soDienThoai: '0987334455',
      tenMay: 'HP Pavilion 15',
      matHangThay: 'Màn hình 15.6" FHD IPS',
      soTien: 1650000,
      ngayThay: fourteenMonthsAgo,
      baoHanhThang: 12,
      ngayHetBaoHanh: calculateWarrantyEndDate(fourteenMonthsAgo, 12),
      ghiChu: 'Đã thay tại cửa hàng',
    },
  ];

  return { customers, items };
}

function shiftDaysISO(baseISO: string, deltaDays: number): string {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      shopInfo: {
        ...DEFAULT_SETTINGS.shopInfo,
        ...(parsed.shopInfo || {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadLocalDataset(): AppDataset {
  try {
    const raw = localStorage.getItem(LOCAL_DATA_KEY);
    if (!raw) {
      const demo = createDemoDataset();
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(demo));
      return demo;
    }
    return JSON.parse(raw) as AppDataset;
  } catch {
    return createDemoDataset();
  }
}

function saveLocalDataset(dataset: AppDataset): void {
  localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(dataset));
}

export function clearDemoData(): AppDataset {
  const empty: AppDataset = { customers: [], items: [] };
  saveLocalDataset(empty);
  return empty;
}

async function callAppsScript<T = unknown>(
  settings: AppSettings,
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  if (!settings.webAppUrl.trim()) {
    throw new Error('Chưa nhập Web App URL của Google Apps Script.');
  }

  const res = await fetch(settings.webAppUrl.trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      secret: settings.secretKey.trim(),
      action,
      payload,
    }),
  });

  if (!res.ok) {
    throw new Error(`Lỗi kết nối máy chủ Google Apps Script (HTTP ${res.status}).`);
  }

  const json = (await res.json()) as { ok: boolean; data?: T; message?: string; error?: string };
  if (!json.ok) {
    throw new Error(json.error || 'Google Apps Script trả về lỗi không xác định.');
  }

  return (json.data ?? (json as unknown)) as T;
}

export async function testAndInitSheets(settings: AppSettings): Promise<string> {
  await callAppsScript(settings, 'ping');
  await callAppsScript(settings, 'initSheets');
  return 'Kết nối thành công! Đã sẵn sàng 2 bảng KhachHang và LichSuThayThe.';
}

export async function fetchAllData(settings: AppSettings): Promise<AppDataset> {
  if (settings.mode === 'sheets' && settings.webAppUrl.trim()) {
    const data = await callAppsScript<AppDataset>(settings, 'getAll');
    saveLocalDataset(data); // Cập nhật cache cục bộ
    return data;
  }
  return loadLocalDataset();
}

export async function createOrderInStorage(
  settings: AppSettings,
  customer: Customer,
  items: RepairItem[]
): Promise<AppDataset> {
  const local = loadLocalDataset();
  const nextCustomers = upsertCustomerInList(local.customers, customer);
  const nextItems = [...items, ...local.items];
  const nextDataset = { customers: nextCustomers, items: nextItems };

  if (settings.mode === 'sheets' && settings.webAppUrl.trim()) {
    await callAppsScript(settings, 'createOrder', { customer, items });
  }
  saveLocalDataset(nextDataset);
  return nextDataset;
}

export async function updateOrderInStorage(
  settings: AppSettings,
  maDonHang: string,
  customer: Customer,
  items: RepairItem[]
): Promise<AppDataset> {
  const local = loadLocalDataset();
  const nextCustomers = upsertCustomerInList(local.customers, customer);
  const remainingItems = local.items.filter((it) => it.maDonHang !== maDonHang);
  const nextItems = [...items, ...remainingItems];
  const nextDataset = { customers: nextCustomers, items: nextItems };

  if (settings.mode === 'sheets' && settings.webAppUrl.trim()) {
    await callAppsScript(settings, 'updateOrder', { maDonHang, customer, items });
  }
  saveLocalDataset(nextDataset);
  return nextDataset;
}

export async function deleteOrderInStorage(
  settings: AppSettings,
  maDonHang: string
): Promise<AppDataset> {
  const local = loadLocalDataset();
  const nextItems = local.items.filter((it) => it.maDonHang !== maDonHang);
  const nextDataset = { ...local, items: nextItems };

  if (settings.mode === 'sheets' && settings.webAppUrl.trim()) {
    await callAppsScript(settings, 'deleteOrder', { maDonHang });
  }
  saveLocalDataset(nextDataset);
  return nextDataset;
}

export async function upsertCustomerInStorage(
  settings: AppSettings,
  customer: Customer
): Promise<AppDataset> {
  const local = loadLocalDataset();
  const nextCustomers = upsertCustomerInList(local.customers, customer);
  const nextItems = local.items.map((it) =>
    it.khachHangId === customer.id
      ? { ...it, tenKhachHang: customer.tenKhachHang, soDienThoai: customer.soDienThoai }
      : it
  );
  const nextDataset = { customers: nextCustomers, items: nextItems };

  if (settings.mode === 'sheets' && settings.webAppUrl.trim()) {
    await callAppsScript(settings, 'upsertCustomer', customer as unknown as Record<string, unknown>);
  }
  saveLocalDataset(nextDataset);
  return nextDataset;
}

export async function deleteCustomerInStorage(
  settings: AppSettings,
  customerId: string
): Promise<AppDataset> {
  const local = loadLocalDataset();
  const nextCustomers = local.customers.filter((c) => c.id !== customerId);
  const nextDataset = { ...local, customers: nextCustomers };

  if (settings.mode === 'sheets' && settings.webAppUrl.trim()) {
    await callAppsScript(settings, 'deleteCustomer', { id: customerId });
  }
  saveLocalDataset(nextDataset);
  return nextDataset;
}

function upsertCustomerInList(list: Customer[], customer: Customer): Customer[] {
  const idx = list.findIndex((c) => c.id === customer.id);
  if (idx >= 0) {
    const copy = [...list];
    copy[idx] = customer;
    return copy;
  }
  return [customer, ...list];
}
