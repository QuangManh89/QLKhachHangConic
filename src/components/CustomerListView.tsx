import { useMemo, useState } from 'react';
import { Search, Phone, ChevronRight, Users, Plus, X } from 'lucide-react';
import type { Customer, RepairItem } from '../types';
import {
  formatCurrencyVND,
  formatDateVN,
  getWarrantyInfo,
  groupItemsIntoOrders,
  normalizeSearchText,
} from '../utils/warranty';

interface CustomerListViewProps {
  customers: Customer[];
  items: RepairItem[];
  onSelectCustomer: (customerId: string) => void;
  onAddOrderForCustomer: (customer: Customer) => void;
}

export function CustomerListView({
  customers,
  items,
  onSelectCustomer,
  onAddOrderForCustomer,
}: CustomerListViewProps) {
  const [search, setSearch] = useState('');

  const enrichedCustomers = useMemo(() => {
    const query = normalizeSearchText(search);
    return customers
      .map((c) => {
        const customerItems = items.filter((it) => it.khachHangId === c.id);
        const orders = groupItemsIntoOrders(customerItems);
        const totalSpent = customerItems.reduce((s, it) => s + (Number(it.soTien) || 0), 0);
        const activeWarranties = customerItems.filter((it) => {
          const st = getWarrantyInfo(it.ngayHetBaoHanh, it.baoHanhThang).status;
          return st === 'active' || st === 'expiring';
        }).length;
        const lastVisit = orders[0]?.ngayThay || c.ngayTao;
        return {
          customer: c,
          orderCount: orders.length,
          itemCount: customerItems.length,
          totalSpent,
          activeWarranties,
          lastVisit,
        };
      })
      .filter((entry) => {
        if (!query) return true;
        const hay = normalizeSearchText(
          `${entry.customer.tenKhachHang} ${entry.customer.soDienThoai} ${entry.customer.ghiChu}`
        );
        return hay.includes(query);
      })
      .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  }, [customers, items, search]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khách hàng theo tên, số điện thoại hoặc ghi chú..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Cards / Table */}
      {enrichedCustomers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            Chưa có khách hàng nào khớp tìm kiếm
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Khách hàng sẽ tự động được tạo khi bạn lập đơn thay linh kiện mới.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Số điện thoại</th>
                  <th className="px-4 py-3 text-center">Số lần sửa</th>
                  <th className="px-4 py-3 text-center">Còn bảo hành</th>
                  <th className="px-4 py-3 text-right">Tổng chi tiêu</th>
                  <th className="px-4 py-3">Lần gần nhất</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {enrichedCustomers.map(
                  ({ customer, orderCount, itemCount, totalSpent, activeWarranties, lastVisit }) => (
                    <tr
                      key={customer.id}
                      onClick={() => onSelectCustomer(customer.id)}
                      className="cursor-pointer transition hover:bg-blue-50/40 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {customer.tenKhachHang}
                        </div>
                        {customer.ghiChu && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {customer.ghiChu}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {customer.soDienThoai}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {orderCount} đơn
                        </span>
                        <span className="ml-1 text-xs text-slate-400">({itemCount} món)</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        {activeWarranties > 0 ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {activeWarranties} linh kiện
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrencyVND(totalSpent)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatDateVN(lastVisit)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddOrderForCustomer(customer);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Đơn mới
                          </button>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
