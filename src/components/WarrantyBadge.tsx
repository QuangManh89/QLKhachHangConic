import { ShieldCheck, ShieldAlert, ShieldX, MinusCircle } from 'lucide-react';
import { getWarrantyInfo } from '../utils/warranty';

interface WarrantyBadgeProps {
  ngayHetBaoHanh: string;
  baoHanhThang: number;
  compact?: boolean;
}

export function WarrantyBadge({ ngayHetBaoHanh, baoHanhThang, compact = false }: WarrantyBadgeProps) {
  const info = getWarrantyInfo(ngayHetBaoHanh, baoHanhThang);

  if (info.status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <span>{compact ? 'Còn hạn' : info.label}</span>
      </span>
    );
  }

  if (info.status === 'expiring') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
        <span>{compact ? 'Sắp hết hạn' : `Sắp hết (${info.label})`}</span>
      </span>
    );
  }

  if (info.status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
        <ShieldX className="h-3.5 w-3.5 shrink-0" />
        <span>Hết hạn</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
      <MinusCircle className="h-3.5 w-3.5 shrink-0" />
      <span>Không BH</span>
    </span>
  );
}
