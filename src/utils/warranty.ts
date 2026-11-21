import type { RepairItem, RepairOrder, WarrantyInfo } from '../types';

export const EXPIRING_THRESHOLD_DAYS = 30;

/**
 * Trả về ngày hiện tại dạng YYYY-MM-DD theo múi giờ máy người dùng.
 */
export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Cộng số tháng vào ngày ISO (YYYY-MM-DD), xử lý chuẩn ngày cuối tháng (VD: 31/01 + 1 tháng = 28/02).
 */
export function calculateWarrantyEndDate(startDateISO: string, months: number): string {
  if (!startDateISO || !Number.isFinite(months) || months <= 0) {
    return '';
  }

  const parts = startDateISO.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return '';
  }

  const [year, month, day] = parts;
  const totalMonths = year * 12 + (month - 1) + Math.round(months);
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonthIndex = totalMonths % 12; // 0..11

  const lastDayOfTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  const targetDay = Math.min(day, lastDayOfTargetMonth);

  const mm = String(targetMonthIndex + 1).padStart(2, '0');
  const dd = String(targetDay).padStart(2, '0');
  return `${targetYear}-${mm}-${dd}`;
}

/**
 * Tính trạng thái bảo hành và số ngày còn lại so với referenceDateISO (mặc định hôm nay).
 */
export function getWarrantyInfo(
  ngayHetBaoHanh: string,
  baoHanhThang: number,
  referenceDateISO: string = getTodayISO()
): WarrantyInfo {
  if (!baoHanhThang || baoHanhThang <= 0 || !ngayHetBaoHanh) {
    return {
      status: 'none',
      daysRemaining: null,
      label: 'Không bảo hành',
    };
  }

  const endMs = parseISODateToUtcMs(ngayHetBaoHanh);
  const refMs = parseISODateToUtcMs(referenceDateISO);

  if (endMs === null || refMs === null) {
    return {
      status: 'none',
      daysRemaining: null,
      label: 'Không xác định',
    };
  }

  const diffDays = Math.round((endMs - refMs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      daysRemaining: diffDays,
      label: 'Hết hạn',
    };
  }

  if (diffDays <= EXPIRING_THRESHOLD_DAYS) {
    return {
      status: 'expiring',
      daysRemaining: diffDays,
      label: diffDays === 0 ? 'Hết hạn hôm nay' : `Còn ${diffDays} ngày`,
    };
  }

  return {
    status: 'active',
    daysRemaining: diffDays,
    label: `Còn ${diffDays} ngày`,
  };
}

function parseISODateToUtcMs(dateISO: string): number | null {
  const parts = dateISO.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return Date.UTC(parts[0], parts[1] - 1, parts[2]);
}

export function formatCurrencyVND(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('vi-VN').format(safe) + ' ₫';
}

export function formatDateVN(dateISO: string): string {
  if (!dateISO) return '—';
  const parts = dateISO.split('-');
  if (parts.length !== 3) return dateISO;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Chuẩn hóa chuỗi tiếng Việt (bỏ dấu, chữ thường) để tìm kiếm nhanh.
 */
export function normalizeSearchText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

export function normalizePhone(phone: string): string {
  return (phone || '').replace(/[^\d+]/g, '').trim();
}

/**
 * Gom danh sách RepairItem thành RepairOrder theo maDonHang, sắp xếp mới nhất trước.
 */
export function groupItemsIntoOrders(items: RepairItem[]): RepairOrder[] {
  const map = new Map<string, RepairOrder>();

  for (const item of items) {
    const key = item.maDonHang || item.id;
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
      existing.tongTien += Number(item.soTien) || 0;
    } else {
      map.set(key, {
        maDonHang: key,
        khachHangId: item.khachHangId,
        tenKhachHang: item.tenKhachHang,
        soDienThoai: item.soDienThoai,
        tenMay: item.tenMay,
        ngayThay: item.ngayThay,
        items: [item],
        tongTien: Number(item.soTien) || 0,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.ngayThay !== a.ngayThay) {
      return b.ngayThay.localeCompare(a.ngayThay);
    }
    return b.maDonHang.localeCompare(a.maDonHang);
  });
}

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${ts}${rand}`;
}

export function generateOrderCode(dateISO: string = getTodayISO()): string {
  const compactDate = dateISO.replace(/-/g, '');
  const rand = Math.floor(100 + Math.random() * 900);
  return `DH-${compactDate}-${rand}`;
}
