import { useEffect, useMemo, useState } from 'react';
import { X, Phone, Plus, Printer, Pencil, Check, Trash2, Laptop, Calendar } from 'lucide-react';
import type { Customer, RepairItem, RepairOrder } from '../types';
import {
  formatCurrencyVND,
  formatDateVN,
  groupItemsIntoOrders,
  normalizePhone,
} from '../utils/warranty';
import { WarrantyBadge } from './WarrantyBadge';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  items: RepairItem[];
  onClose: () => void;
  onAddOrder: (customer: Customer) => void;
  onPrintOrder: (order: RepairOrder) => void;
  onEditOrder: (order: RepairOrder) => void;
  onUpdateCustomer: (customer: Customer) => Promise<void>;
  onDeleteCustomer: (customer: Customer) => Promise<void>;
}

export function CustomerDetailDrawer({
  customer,
  items,
  onClose,
  onAddOrder,
  onPrintOrder,
  onEditOrder,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerDetailDrawerProps) {
  const [editingInfo, setEditingInfo] = useState(false);
  const [tenKhachHang, setTenKhachHang] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setTenKhachHang(customer.tenKhachHang);
      setSoDienThoai(customer.soDienThoai);
      setGhiChu(customer.ghiChu || '');
      setEditingInfo(false);
    }
  }, [customer]);

  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return groupItemsIntoOrders(items.filter((it) => it.khachHangId === customer.id));
  }, [customer, items]);

  const totalSpent = useMemo(
    () => customerOrders.reduce((sum, o) => sum + o.tongTien, 0),
    [customerOrders]
  );

  if (!customer) return null;

  const handleSaveProfile = async () => {
    if (!tenKhachHang.trim() || !normalizePhone(soDienThoai)) return;
    setSaving(true);
    try {
      await onUpdateCustomer({
        ...customer,
        tenKhachHang: tenKhachHang.trim(),
        soDienThoai: normalizePhone(soDienThoai),
        ghiChu: ghiChu.trim(),
      });
      setEditingInfo(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Hồ sơ khách hàng
            </span>
            <h2 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
              {customer.tenKhachHang}
            </h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Phone className="h-3.5 w-3.5" />
                {customer.soDienThoai}
              </span>
              <span>•</span>
              <span>Tham gia: {formatDateVN(customer.ngayTao)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Tổng số lần thay thế</div>
              <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {customerOrders.length} đơn
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Tổng chi tiêu</div>
              <div className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrencyVND(totalSpent)}
              </div>
            </div>
          </div>

          {/* Profile Info / Edit */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Thông tin liên hệ
              </h3>
              {!editingInfo ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingInfo(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Sửa
                  </button>
                  {customerOrders.length === 0 && (
                    <button
                      type="button"
                      onClick={() => onDeleteCustomer(customer)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingInfo(false)}
                    className="text-xs font-medium text-slate-500 hover:underline"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Lưu
                  </button>
                </div>
              )}
            </div>

            {editingInfo ? (
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={tenKhachHang}
                  onChange={(e) => setTenKhachHang(e.target.value)}
                  placeholder="Tên khách hàng"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="tel"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  placeholder="Số điện thoại"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="text"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder="Ghi chú thêm (địa chỉ, đặc điểm...)"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {customer.ghiChu || 'Chưa có ghi chú cho khách hàng này.'}
              </p>
            )}
          </div>

          {/* Repair History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Lịch sử thay thế & bảo hành ({customerOrders.length})
              </h3>
              <button
                type="button"
                onClick={() => onAddOrder(customer)}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm đơn mới
              </button>
            </div>

            {customerOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Khách hàng chưa có lịch sử thay linh kiện nào.
              </div>
            ) : (
              customerOrders.map((order) => (
                <div
                  key={order.maDonHang}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {order.maDonHang}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {formatDateVN(order.ngayThay)}
                        </span>
                      </div>
                      {order.tenMay && (
                        <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Laptop className="h-3 w-3" />
                          {order.tenMay}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="mr-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrencyVND(order.tongTien)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPrintOrder(order)}
                        title="In phiếu bảo hành"
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditOrder(order)}
                        title="Sửa đơn"
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <ul className="mt-2.5 space-y-2">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {item.matHangThay}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {formatCurrencyVND(item.soTien)} • BH:{' '}
                            {item.baoHanhThang > 0
                              ? `${item.baoHanhThang} tháng (đến ${formatDateVN(item.ngayHetBaoHanh)})`
                              : 'Không'}
                          </div>
                        </div>
                        <WarrantyBadge
                          ngayHetBaoHanh={item.ngayHetBaoHanh}
                          baoHanhThang={item.baoHanhThang}
                          compact
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
