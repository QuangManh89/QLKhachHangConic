import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { X, Plus, Trash2, UserCheck, UserPlus } from 'lucide-react';
import type { Customer, RepairItem, RepairOrder } from '../types';
import {
  calculateWarrantyEndDate,
  formatCurrencyVND,
  formatDateVN,
  generateId,
  generateOrderCode,
  getTodayISO,
  normalizePhone,
  normalizeSearchText,
} from '../utils/warranty';

interface ItemDraft {
  id: string;
  matHangThay: string;
  soTien: string;
  baoHanhThang: number;
  ghiChu: string;
}

interface OrderFormModalProps {
  open: boolean;
  customers: Customer[];
  editingOrder: RepairOrder | null;
  preselectedCustomer: Customer | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    isEdit: boolean;
    maDonHang: string;
    customer: Customer;
    items: RepairItem[];
  }) => Promise<void>;
}

const QUICK_WARRANTY_MONTHS = [0, 1, 3, 6, 12, 24, 36];

function createEmptyItem(): ItemDraft {
  return {
    id: generateId('ITEM'),
    matHangThay: '',
    soTien: '',
    baoHanhThang: 12,
    ghiChu: '',
  };
}

export function OrderFormModal({
  open,
  customers,
  editingOrder,
  preselectedCustomer,
  saving,
  onClose,
  onSubmit,
}: OrderFormModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [tenKhachHang, setTenKhachHang] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [ghiChuKhach, setGhiChuKhach] = useState('');
  const [tenMay, setTenMay] = useState('');
  const [ngayThay, setNgayThay] = useState(getTodayISO());
  const [itemDrafts, setItemDrafts] = useState<ItemDraft[]>([createEmptyItem()]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setShowSuggestions(false);

    if (editingOrder) {
      const matchedCustomer = customers.find((c) => c.id === editingOrder.khachHangId);
      setSelectedCustomerId(editingOrder.khachHangId);
      setTenKhachHang(editingOrder.tenKhachHang);
      setSoDienThoai(editingOrder.soDienThoai);
      setGhiChuKhach(matchedCustomer?.ghiChu || '');
      setTenMay(editingOrder.tenMay || '');
      setNgayThay(editingOrder.ngayThay || getTodayISO());
      setItemDrafts(
        editingOrder.items.map((it) => ({
          id: it.id,
          matHangThay: it.matHangThay,
          soTien: String(it.soTien),
          baoHanhThang: it.baoHanhThang,
          ghiChu: it.ghiChu || '',
        }))
      );
    } else if (preselectedCustomer) {
      setSelectedCustomerId(preselectedCustomer.id);
      setTenKhachHang(preselectedCustomer.tenKhachHang);
      setSoDienThoai(preselectedCustomer.soDienThoai);
      setGhiChuKhach(preselectedCustomer.ghiChu || '');
      setTenMay('');
      setNgayThay(getTodayISO());
      setItemDrafts([createEmptyItem()]);
    } else {
      setSelectedCustomerId('');
      setTenKhachHang('');
      setSoDienThoai('');
      setGhiChuKhach('');
      setTenMay('');
      setNgayThay(getTodayISO());
      setItemDrafts([createEmptyItem()]);
    }
  }, [open, editingOrder, preselectedCustomer, customers]);

  const customerSuggestions = useMemo(() => {
    const q = normalizeSearchText(`${tenKhachHang} ${soDienThoai}`);
    if (!q || selectedCustomerId) return [];
    return customers
      .filter((c) => {
        const hay = normalizeSearchText(`${c.tenKhachHang} ${c.soDienThoai}`);
        return hay.includes(q);
      })
      .slice(0, 5);
  }, [customers, tenKhachHang, soDienThoai, selectedCustomerId]);

  const totalAmount = useMemo(() => {
    return itemDrafts.reduce((sum, it) => sum + (Number(it.soTien.replace(/[^\d]/g, '')) || 0), 0);
  }, [itemDrafts]);

  if (!open) return null;

  const handlePickCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setTenKhachHang(c.tenKhachHang);
    setSoDienThoai(c.soDienThoai);
    setGhiChuKhach(c.ghiChu || '');
    setShowSuggestions(false);
  };

  const handleClearPickedCustomer = () => {
    setSelectedCustomerId('');
  };

  const updateItem = (idx: number, patch: Partial<ItemDraft>) => {
    setItemDrafts((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItemRow = () => {
    setItemDrafts((prev) => [...prev, createEmptyItem()]);
  };

  const removeItemRow = (idx: number) => {
    if (itemDrafts.length <= 1) return;
    setItemDrafts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = tenKhachHang.trim();
    const cleanPhone = normalizePhone(soDienThoai);

    if (!cleanName) {
      setError('Vui lòng nhập tên khách hàng.');
      return;
    }
    if (!cleanPhone) {
      setError('Vui lòng nhập số điện thoại khách hàng.');
      return;
    }

    const validItems = itemDrafts.filter((it) => it.matHangThay.trim() !== '');
    if (validItems.length === 0) {
      setError('Vui lòng nhập ít nhất 1 mặt hàng / linh kiện thay thế.');
      return;
    }

    // Tìm khách cũ theo ID đã chọn hoặc trùng SĐT chính xác
    const existingById = customers.find((c) => c.id === selectedCustomerId);
    const existingByPhone = customers.find((c) => normalizePhone(c.soDienThoai) === cleanPhone);
    const baseCustomer = existingById || existingByPhone;

    const customer: Customer = {
      id: baseCustomer ? baseCustomer.id : generateId('KH'),
      tenKhachHang: cleanName,
      soDienThoai: cleanPhone,
      ghiChu: ghiChuKhach.trim() || baseCustomer?.ghiChu || '',
      ngayTao: baseCustomer ? baseCustomer.ngayTao : getTodayISO(),
    };

    const maDonHang = editingOrder ? editingOrder.maDonHang : generateOrderCode(ngayThay);

    const repairItems: RepairItem[] = validItems.map((draft) => {
      const price = Number(draft.soTien.replace(/[^\d]/g, '')) || 0;
      const months = Math.max(0, Number(draft.baoHanhThang) || 0);
      return {
        id: draft.id || generateId('ITEM'),
        maDonHang,
        khachHangId: customer.id,
        tenKhachHang: customer.tenKhachHang,
        soDienThoai: customer.soDienThoai,
        tenMay: tenMay.trim(),
        matHangThay: draft.matHangThay.trim(),
        soTien: price,
        ngayThay,
        baoHanhThang: months,
        ngayHetBaoHanh: calculateWarrantyEndDate(ngayThay, months),
        ghiChu: draft.ghiChu.trim(),
      };
    });

    setError('');
    await onSubmit({
      isEdit: Boolean(editingOrder),
      maDonHang,
      customer,
      items: repairItems,
    });
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingOrder ? `Chỉnh sửa đơn ${editingOrder.maDonHang}` : 'Tạo đơn thay linh kiện mới'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hỗ trợ thêm nhiều linh kiện với thời hạn bảo hành riêng trong cùng 1 đơn hàng
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* Customer Section */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  1. Thông tin khách hàng & thiết bị
                </h3>
                {selectedCustomerId ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    <UserCheck className="h-3.5 w-3.5" />
                    Khách hàng cũ
                    {!editingOrder && (
                      <button
                        type="button"
                        onClick={handleClearPickedCustomer}
                        className="ml-1 underline hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        Đổi
                      </button>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <UserPlus className="h-3.5 w-3.5" />
                    Tự động lưu khách mới nếu SĐT chưa tồn tại
                  </span>
                )}
              </div>

              <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Tên khách hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tenKhachHang}
                    onChange={(e) => {
                      setTenKhachHang(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={soDienThoai}
                    onChange={(e) => {
                      setSoDienThoai(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="VD: 0908123456"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {/* Autocomplete dropdown */}
                {showSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[68px] z-20 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <div className="px-2.5 py-1 text-[11px] font-semibold uppercase text-slate-400">
                      Gợi ý khách hàng đã có
                    </div>
                    {customerSuggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handlePickCustomer(c)}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-slate-800"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {c.tenKhachHang}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {c.soDienThoai}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Ngày thay <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={ngayThay}
                    onChange={(e) => setNgayThay(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Tên máy / Model (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={tenMay}
                    onChange={(e) => setTenMay(e.target.value)}
                    placeholder="VD: Dell XPS 13, PC Gaming i5..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  2. Danh sách mặt hàng / linh kiện thay thế ({itemDrafts.length})
                </h3>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm linh kiện
                </button>
              </div>

              <div className="space-y-3">
                {itemDrafts.map((item, idx) => {
                  const previewEnd = calculateWarrantyEndDate(ngayThay, item.baoHanhThang);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Linh kiện #{idx + 1}
                        </span>
                        {itemDrafts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa dòng
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                        <div className="sm:col-span-6">
                          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                            Thay mặt hàng gì <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.matHangThay}
                            onChange={(e) => updateItem(idx, { matHangThay: e.target.value })}
                            placeholder="VD: SSD NVMe 512GB, RAM 16GB DDR4..."
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                            Số tiền (VNĐ) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={item.soTien}
                            onChange={(e) => updateItem(idx, { soTien: e.target.value })}
                            placeholder="VD: 1200000"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                            Bảo hành (tháng)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={120}
                            value={item.baoHanhThang}
                            onChange={(e) =>
                              updateItem(idx, { baoHanhThang: Math.max(0, Number(e.target.value) || 0) })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Quick Warranty Chips + End Date Preview */}
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="mr-1 text-[11px] text-slate-400">Chọn nhanh BH:</span>
                          {QUICK_WARRANTY_MONTHS.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => updateItem(idx, { baoHanhThang: m })}
                              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                                item.baoHanhThang === m
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {m === 0 ? 'Không' : `${m}T`}
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Hết hạn BH:{' '}
                          <strong className="font-semibold text-slate-700 dark:text-slate-200">
                            {previewEnd ? formatDateVN(previewEnd) : 'Không bảo hành'}
                          </strong>
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={item.ghiChu}
                          onChange={(e) => updateItem(idx, { ghiChu: e.target.value })}
                          placeholder="Ghi chú tem bảo hành / số serial (tùy chọn)..."
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                {error}
              </div>
            )}
          </div>

          {/* Sticky Footer inside form */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Tổng cộng đơn hàng</span>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrencyVND(totalAmount)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving
                  ? 'Đang lưu...'
                  : editingOrder
                    ? 'Lưu thay đổi'
                    : 'Lưu đơn hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
