import { describe, expect, it } from 'vitest';
import {
  calculateWarrantyEndDate,
  formatCurrencyVND,
  formatDateVN,
  getWarrantyInfo,
  groupItemsIntoOrders,
  normalizeSearchText,
} from './warranty';
import type { RepairItem } from '../types';

describe('calculateWarrantyEndDate', () => {
  it('adds standard months correctly', () => {
    expect(calculateWarrantyEndDate('2026-05-15', 12)).toBe('2027-05-15');
    expect(calculateWarrantyEndDate('2026-05-15', 36)).toBe('2029-05-15');
  });

  it('handles end-of-month clamping (Jan 31 + 1 month -> Feb 28/29)', () => {
    expect(calculateWarrantyEndDate('2026-01-31', 1)).toBe('2026-02-28');
    expect(calculateWarrantyEndDate('2024-01-31', 1)).toBe('2024-02-29');
  });

  it('returns empty string for 0 or negative warranty months', () => {
    expect(calculateWarrantyEndDate('2026-05-15', 0)).toBe('');
    expect(calculateWarrantyEndDate('2026-05-15', -3)).toBe('');
  });
});

describe('getWarrantyInfo', () => {
  it('returns none when warranty is 0 months', () => {
    const info = getWarrantyInfo('', 0, '2026-11-21');
    expect(info.status).toBe('none');
    expect(info.daysRemaining).toBeNull();
  });

  it('returns active when > 30 days remaining', () => {
    const info = getWarrantyInfo('2027-01-15', 12, '2026-11-21');
    expect(info.status).toBe('active');
    expect(info.daysRemaining).toBe(55);
  });

  it('returns expiring when between 0 and 30 days remaining', () => {
    const info30 = getWarrantyInfo('2026-12-21', 6, '2026-11-21');
    expect(info30.status).toBe('expiring');
    expect(info30.daysRemaining).toBe(30);

    const info0 = getWarrantyInfo('2026-11-21', 6, '2026-11-21');
    expect(info0.status).toBe('expiring');
    expect(info0.daysRemaining).toBe(0);
    expect(info0.label).toBe('Hết hạn hôm nay');
  });

  it('returns expired when past end date', () => {
    const info = getWarrantyInfo('2026-11-20', 6, '2026-11-21');
    expect(info.status).toBe('expired');
    expect(info.daysRemaining).toBe(-1);
  });
});

describe('formatting & grouping helpers', () => {
  it('formats Vietnamese currency and dates', () => {
    expect(formatCurrencyVND(1250000)).toMatch(/1[.,]250[.,]000 ₫/);
    expect(formatDateVN('2026-11-21')).toBe('21/11/2026');
  });

  it('normalizes Vietnamese diacritics for search', () => {
    expect(normalizeSearchText('Nguyễn Văn Đạt')).toBe('nguyen van dat');
  });

  it('groups items by maDonHang and calculates order total', () => {
    const items: RepairItem[] = [
      {
        id: 'ITEM-1',
        maDonHang: 'DH-20261121-101',
        khachHangId: 'KH-1',
        tenKhachHang: 'Nguyễn Minh Quân',
        soDienThoai: '0901234567',
        tenMay: 'Dell XPS 13',
        matHangThay: 'SSD NVMe 512GB',
        soTien: 1200000,
        ngayThay: '2026-11-21',
        baoHanhThang: 36,
        ngayHetBaoHanh: '2029-11-21',
        ghiChu: '',
      },
      {
        id: 'ITEM-2',
        maDonHang: 'DH-20261121-101',
        khachHangId: 'KH-1',
        tenKhachHang: 'Nguyễn Minh Quân',
        soDienThoai: '0901234567',
        tenMay: 'Dell XPS 13',
        matHangThay: 'Vệ sinh + tra keo tản nhiệt',
        soTien: 150000,
        ngayThay: '2026-11-21',
        baoHanhThang: 1,
        ngayHetBaoHanh: '2026-12-21',
        ghiChu: '',
      },
    ];

    const orders = groupItemsIntoOrders(items);
    expect(orders).toHaveLength(1);
    expect(orders[0].items).toHaveLength(2);
    expect(orders[0].tongTien).toBe(1350000);
  });
});
