import { X, Printer } from 'lucide-react';
import type { RepairOrder, ShopInfo } from '../types';
import { formatCurrencyVND, formatDateVN } from '../utils/warranty';

interface WarrantyPrintModalProps {
  order: RepairOrder | null;
  shopInfo: ShopInfo;
  onClose: () => void;
}

export function WarrantyPrintModal({ order, shopInfo, onClose }: WarrantyPrintModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-only-container fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="print-only-container flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Toolbar (hidden when printing) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="text-sm font-semibold text-slate-800">
            Xem trước Phiếu Bảo Hành — {order.maDonHang}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              In phiếu ngay
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto bg-white p-6 text-slate-900 sm:p-8">
          {/* Shop Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
                <img
                  src="/logo.png"
                  alt="ConicComputer Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                  {shopInfo.name || 'ConicComputer'}
                </h1>
                <p className="text-xs text-slate-600">{shopInfo.address}</p>
                <p className="text-xs text-slate-600">
                  Hotline: <strong>{shopInfo.phone}</strong>
                  {shopInfo.website ? ` • ${shopInfo.website}` : ''}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold uppercase tracking-wide text-blue-700">
                PHIẾU BẢO HÀNH & HÓA ĐƠN
              </div>
              <div className="mt-0.5 font-mono text-xs font-semibold text-slate-700">
                Mã đơn: {order.maDonHang}
              </div>
              <div className="text-xs text-slate-600">
                Ngày thay: <strong>{formatDateVN(order.ngayThay)}</strong>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm sm:grid-cols-3">
            <div>
              <span className="text-xs text-slate-500">Khách hàng:</span>
              <div className="font-semibold text-slate-900">{order.tenKhachHang}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Số điện thoại:</span>
              <div className="font-semibold text-slate-900">{order.soDienThoai}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Thiết bị / Model:</span>
              <div className="font-semibold text-slate-900">{order.tenMay || '—'}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-300">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-800">
                  <th className="w-10 px-3 py-2 text-center font-semibold">STT</th>
                  <th className="px-3 py-2 font-semibold">Mặt hàng / Linh kiện thay thế</th>
                  <th className="px-3 py-2 text-center font-semibold">Bảo hành</th>
                  <th className="px-3 py-2 text-center font-semibold">Hết hạn BH</th>
                  <th className="px-3 py-2 text-right font-semibold">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2.5 text-center text-slate-600">{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-900">{item.matHangThay}</div>
                      {item.ghiChu && (
                        <div className="text-[11px] text-slate-500">Ghi chú: {item.ghiChu}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      {item.baoHanhThang > 0 ? `${item.baoHanhThang} tháng` : 'Không BH'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center font-medium">
                      {item.ngayHetBaoHanh ? formatDateVN(item.ngayHetBaoHanh) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">
                      {formatCurrencyVND(item.soTien)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td colSpan={4} className="px-3 py-2.5 text-right text-sm font-bold uppercase">
                    Tổng cộng thanh toán
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-base font-bold text-blue-700">
                    {formatCurrencyVND(order.tongTien)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Warranty Terms */}
          {shopInfo.warrantyNote && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-600">
              <strong className="text-slate-800">Quy định bảo hành: </strong>
              {shopInfo.warrantyNote}
            </div>
          )}

          {/* Signatures */}
          <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs sm:text-sm">
            <div>
              <div className="font-semibold text-slate-800">Khách hàng</div>
              <div className="text-[11px] italic text-slate-500">(Ký, ghi rõ họ tên)</div>
              <div className="mt-14 font-medium text-slate-700">{order.tenKhachHang}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Đại diện {shopInfo.name}</div>
              <div className="text-[11px] italic text-slate-500">(Ký, ghi rõ họ tên)</div>
              <div className="mt-14 font-medium text-slate-700">Kỹ thuật viên / Thu ngân</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
