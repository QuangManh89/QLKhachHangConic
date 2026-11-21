import { useMemo, useState } from 'react';
import {
  Search,
  Printer,
  Pencil,
  Trash2,
  Phone,
  Laptop,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Receipt,
  Package,
  X,
} from 'lucide-react';
import type { RepairItem, RepairOrder, WarrantyStatus } from '../types';
import {
  formatCurrencyVND,
  formatDateVN,
  getWarrantyInfo,
  groupItemsIntoOrders,
  normalizeSearchText,
} from '../utils/warranty';
import { WarrantyBadge } from './WarrantyBadge';

type FilterStatus = 'all' | WarrantyStatus;

interface OrderListViewProps {
  items: RepairItem[];
  onEditOrder: (order: RepairOrder) => void;
  onDeleteOrder: (order: RepairOrder) => void;
  onPrintOrder: (order: RepairOrder) => void;
  onSelectCustomer: (customerId: string) => void;
  onCreateOrder: () => void;
}

export function OrderListView({
  items,
  onEditOrder,
  onDeleteOrder,
  onPrintOrder,
  onSelectCustomer,
  onCreateOrder,
}: OrderListViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const summary = useMemo(() => {
    let activeCount = 0;
    let expiringCount = 0;
    let totalRevenue = 0;
    for (const item of items) {
      totalRevenue += Number(item.soTien) || 0;
      const st = getWarrantyInfo(item.ngayHetBaoHanh, item.baoHanhThang).status;
      if (st === 'active') activeCount++;
      if (st === 'expiring') expiringCount++;
    }
    return {
      orderCount: groupItemsIntoOrders(items).length,
      activeCount,
      expiringCount,
      totalRevenue,
    };
  }, [items]);

  const filteredOrders = useMemo(() => {
    const query = normalizeSearchText(search);
    const allOrders = groupItemsIntoOrders(items);

    return allOrders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' ||
        order.items.some(
          (it) => getWarrantyInfo(it.ngayHetBaoHanh, it.baoHanhThang).status === statusFilter
        );

      if (!matchesStatus) return false;
      if (!query) return true;

      const haystack = normalizeSearchText(
        [
          order.maDonHang,
          order.tenKhachHang,
          order.soDienThoai,
          order.tenMay,
          ...order.items.map((it) => `${it.matHangThay} ${it.ghiChu}`),
        ].join(' ')
      );
      return haystack.includes(query);
    });
  }, [items, search, statusFilter]);

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'active', label: 'Còn bảo hành' },
    { key: 'expiring', label: 'Sắp hết hạn (≤30 ngày)' },
    { key: 'expired', label: 'Hết hạn' },
  ];

  return (
    <div className="space-y-5">
      {/* Compact Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Tổng đơn thay thế</span>
            <Receipt className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
            {summary.orderCount}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {items.length} linh kiện / dịch vụ
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Đang còn bảo hành</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.activeCount + summary.expiringCount}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">linh kiện còn hiệu lực</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Sắp hết hạn (≤30 ngày)</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {summary.expiringCount}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">cần chú ý theo dõi</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Tổng doanh thu</span>
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            {formatCurrencyVND(summary.totalRevenue)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">tổng giá trị đã ghi nhận</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhanh theo SĐT, tên khách hàng, mặt hàng thay, tên máy, mã đơn..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setStatusFilter(btn.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === btn.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <Package className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            Không tìm thấy đơn thay linh kiện nào
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {search || statusFilter !== 'all'
              ? 'Thử đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái bảo hành.'
              : 'Bấm "Tạo đơn mới" để bắt đầu ghi nhận khách hàng và linh kiện thay thế.'}
          </p>
          {!search && statusFilter === 'all' && (
            <button
              type="button"
              onClick={onCreateOrder}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Tạo đơn đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.maDonHang}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:border-blue-300/80 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700/60"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(order.khachHangId)}
                    className="text-left text-sm font-bold text-slate-900 hover:text-blue-600 hover:underline dark:text-white dark:hover:text-blue-400"
                  >
                    {order.tenKhachHang}
                  </button>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {order.soDienThoai}
                  </span>
                  {order.tenMay && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Laptop className="h-3.5 w-3.5 text-slate-400" />
                      {order.tenMay}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Ngày thay: <strong className="font-medium text-slate-700 dark:text-slate-200">{formatDateVN(order.ngayThay)}</strong>
                  </span>
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {order.maDonHang}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="mr-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrencyVND(order.tongTien)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPrintOrder(order)}
                    title="In phiếu bảo hành"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">In phiếu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditOrder(order)}
                    title="Chỉnh sửa đơn"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteOrder(order)}
                    title="Xóa đơn"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500">
                      <th className="px-4 py-2">Mặt hàng / Linh kiện thay thế</th>
                      <th className="px-4 py-2 text-right">Số tiền</th>
                      <th className="px-4 py-2 text-center">Bảo hành</th>
                      <th className="px-4 py-2">Hết hạn BH</th>
                      <th className="px-4 py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {item.matHangThay}
                          </div>
                          {item.ghiChu && (
                            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              Ghi chú: {item.ghiChu}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrencyVND(item.soTien)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-center text-slate-600 dark:text-slate-300">
                          {item.baoHanhThang > 0 ? `${item.baoHanhThang} tháng` : 'Không'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-600 dark:text-slate-300">
                          {item.ngayHetBaoHanh ? formatDateVN(item.ngayHetBaoHanh) : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          <WarrantyBadge
                            ngayHetBaoHanh={item.ngayHetBaoHanh}
                            baoHanhThang={item.baoHanhThang}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
