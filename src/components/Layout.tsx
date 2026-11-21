import {
  Wrench,
  Users,
  Plus,
  RefreshCw,
  Settings,
  Sun,
  Moon,
  Lock,
  Cloud,
  HardDrive,
} from 'lucide-react';

export type ActiveTab = 'orders' | 'customers';

interface LayoutProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  storageMode: 'local' | 'sheets';
  syncing: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSync: () => void;
  onOpenNewOrder: () => void;
  onOpenSettings: () => void;
  onLock: () => void;
  orderCount: number;
  customerCount: number;
  children: React.ReactNode;
}

export function Layout({
  activeTab,
  onTabChange,
  storageMode,
  syncing,
  darkMode,
  onToggleDarkMode,
  onSync,
  onOpenNewOrder,
  onOpenSettings,
  onLock,
  orderCount,
  customerCount,
  children,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="no-print sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Brand + Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-xs dark:border-slate-700">
              <img
                src="/logo.png"
                alt="ConicComputer Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  ConicComputer
                </h1>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  title="Bấm để cấu hình kết nối Google Sheets"
                  className={
                    storageMode === 'sheets'
                      ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300'
                  }
                >
                  {storageMode === 'sheets' ? (
                    <>
                      <Cloud className="h-3 w-3" />
                      <span>Google Sheets</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="h-3 w-3" />
                      <span>Chế độ Demo</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý khách hàng & bảo hành linh kiện
              </p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo đơn mới</span>
            </button>

            <button
              type="button"
              onClick={onSync}
              disabled={syncing}
              title="Đồng bộ dữ liệu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Cài đặt Google Sheets & Cửa hàng"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onLock}
              title="Khóa màn hình"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="-mb-px flex gap-6" aria-label="Điều hướng chính">
            <button
              type="button"
              onClick={() => onTabChange('orders')}
              className={`inline-flex items-center gap-2 border-b-2 py-2.5 text-sm font-medium transition ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Lịch sử & Bảo hành</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {orderCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('customers')}
              className={`inline-flex items-center gap-2 border-b-2 py-2.5 text-sm font-medium transition ${
                activeTab === 'customers'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Khách hàng</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {customerCount}
              </span>
            </button>
          </nav>
        </div>
      </header>

      <main className="no-print mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
