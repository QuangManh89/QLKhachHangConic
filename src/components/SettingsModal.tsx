import { useEffect, useState } from 'react';
import {
  X,
  Cloud,
  Store,
  Shield,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { AppSettings } from '../types';
import { APPS_SCRIPT_CODE } from '../data/appsScriptTemplate';
import { testAndInitSheets } from '../services/storageService';
import { changePin } from '../services/authService';

interface SettingsModalProps {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSaveSettings: (next: AppSettings) => Promise<void>;
  onClearDemoData: () => void;
}

type SettingsTab = 'sheets' | 'shop' | 'security';

export function SettingsModal({
  open,
  settings,
  onClose,
  onSaveSettings,
  onClearDemoData,
}: SettingsModalProps) {
  const [tab, setTab] = useState<SettingsTab>('sheets');
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Security tab state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setTestResult(null);
      setPinFeedback(null);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    }
  }, [open, settings]);

  if (!open) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setTestResult({
        ok: false,
        msg: 'Trình duyệt không cho phép copy tự động. Bạn có thể mở file google-apps-script/Code.gs.',
      });
    }
  };

  const handleTestSheets = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const msg = await testAndInitSheets(draft);
      setTestResult({ ok: true, msg });
    } catch (err) {
      setTestResult({
        ok: false,
        msg: err instanceof Error ? err.message : 'Không thể kết nối Google Sheets.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    await onSaveSettings(draft);
    onClose();
  };

  const handleChangePin = async () => {
    if (newPin !== confirmPin) {
      setPinFeedback({ ok: false, msg: 'Xác nhận mã PIN mới không khớp.' });
      return;
    }
    const res = await changePin(currentPin, newPin);
    if (res.ok) {
      setPinFeedback({ ok: true, msg: 'Đã đổi mã PIN / mật khẩu thành công!' });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setPinFeedback({ ok: false, msg: res.error || 'Đổi mật khẩu thất bại.' });
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Cài đặt hệ thống ConicComputer
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 px-6 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setTab('sheets')}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === 'sheets'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Cloud className="h-4 w-4" />
            Google Sheets
          </button>
          <button
            type="button"
            onClick={() => setTab('shop')}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === 'shop'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Store className="h-4 w-4" />
            Phiếu in cửa hàng
          </button>
          <button
            type="button"
            onClick={() => setTab('security')}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === 'security'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Shield className="h-4 w-4" />
            Bảo mật PIN
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'sheets' && (
            <div className="space-y-4">
              {/* Mode selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chế độ lưu trữ
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, mode: 'local' }))}
                    className={`rounded-xl border p-3 text-left transition ${
                      draft.mode === 'local'
                        ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-500/10'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Chế độ Demo (Trình duyệt)
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Lưu cục bộ để dùng thử ngay không cần cài đặt.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, mode: 'sheets' }))}
                    className={`rounded-xl border p-3 text-left transition ${
                      draft.mode === 'sheets'
                        ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-500/10'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Google Sheets (Khuyên dùng)
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Đồng bộ trực tiếp 2 bảng KhachHang & LichSuThayThe.
                    </div>
                  </button>
                </div>
              </div>

              {/* Google Apps Script Config */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Google Apps Script Web App URL
                  </label>
                  <input
                    type="url"
                    value={draft.webAppUrl}
                    onChange={(e) => setDraft((d) => ({ ...d, webAppUrl: e.target.value }))}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Secret Key (khớp với biến SECRET_KEY trong Code.gs)
                  </label>
                  <input
                    type="text"
                    value={draft.secretKey}
                    onChange={(e) => setDraft((d) => ({ ...d, secretKey: e.target.value }))}
                    placeholder="CONIC_SECRET_2026"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestSheets}
                    disabled={testing || !draft.webAppUrl.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {testing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Kiểm tra & Khởi tạo Sheet
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Đã copy Code.gs!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy mã Code.gs
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-medium ${
                      testResult.ok
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {testResult.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>{testResult.msg}</span>
                  </div>
                )}
              </div>

              {/* Short setup steps */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-slate-300">
                <div className="font-semibold text-blue-800 dark:text-blue-300">
                  Cài đặt nhanh trong 2 phút:
                </div>
                <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                  <li>Tạo 1 file Google Sheets mới → mở <strong>Tiện ích mở rộng → Apps Script</strong>.</li>
                  <li>Bấm <strong>Copy mã Code.gs</strong> ở trên và dán vào, đổi <code>SECRET_KEY</code> theo ý bạn.</li>
                  <li>Bấm <strong>Triển khai → Tùy chọn triển khai mới → Ứng dụng web</strong> (Thực thi: Tôi, Truy cập: Bất kỳ ai).</li>
                  <li>Dán URL nhận được vào ô phía trên và bấm <strong>Kiểm tra & Khởi tạo Sheet</strong>.</li>
                </ol>
              </div>

              {draft.mode === 'local' && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Xóa toàn bộ dữ liệu demo cục bộ trên trình duyệt để bắt đầu trống.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu demo cục bộ?')) {
                        onClearDemoData();
                        onClose();
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa dữ liệu Demo
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'shop' && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thông tin này sẽ hiển thị tự động trên đầu và cuối <strong>Phiếu Bảo Hành</strong> khi bạn bấm in.
              </p>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Tên cửa hàng
                </label>
                <input
                  type="text"
                  value={draft.shopInfo.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, shopInfo: { ...d.shopInfo, name: e.target.value } }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Địa chỉ cửa hàng
                </label>
                <input
                  type="text"
                  value={draft.shopInfo.address}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      shopInfo: { ...d.shopInfo, address: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Hotline / Zalo
                  </label>
                  <input
                    type="text"
                    value={draft.shopInfo.phone}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        shopInfo: { ...d.shopInfo, phone: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Website / Facebook
                  </label>
                  <input
                    type="text"
                    value={draft.shopInfo.website}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        shopInfo: { ...d.shopInfo, website: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Quy định bảo hành cuối phiếu
                </label>
                <textarea
                  rows={3}
                  value={draft.shopInfo.warrantyNote}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      shopInfo: { ...d.shopInfo, warrantyNote: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đổi mật khẩu khóa màn hình khi mở website ConicComputer.
              </p>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Mã PIN / Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Mã PIN / Mật khẩu mới (tối thiểu 4 ký tự)
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Xác nhận mã PIN / Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {pinFeedback && (
                <div
                  className={`rounded-xl px-3 py-2 text-xs font-medium ${
                    pinFeedback.ok
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {pinFeedback.msg}
                </div>
              )}

              <button
                type="button"
                onClick={handleChangePin}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Đóng
          </button>
          {tab !== 'security' && (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Lưu cài đặt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
