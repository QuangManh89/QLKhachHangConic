import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppDataset, AppSettings, Customer, RepairItem, RepairOrder } from './types';
import {
  clearDemoData,
  createOrderInStorage,
  deleteCustomerInStorage,
  deleteOrderInStorage,
  fetchAllData,
  loadSettings,
  saveSettings,
  updateOrderInStorage,
  upsertCustomerInStorage,
} from './services/storageService';
import { ensurePinInitialized, isSessionUnlocked, lockSession } from './services/authService';
import { groupItemsIntoOrders } from './utils/warranty';
import { LockScreen } from './components/LockScreen';
import { Layout, type ActiveTab } from './components/Layout';
import { OrderListView } from './components/OrderListView';
import { CustomerListView } from './components/CustomerListView';
import { OrderFormModal } from './components/OrderFormModal';
import { CustomerDetailDrawer } from './components/CustomerDetailDrawer';
import { WarrantyPrintModal } from './components/WarrantyPrintModal';
import { SettingsModal } from './components/SettingsModal';

const THEME_KEY = 'conic_theme_v1';

export default function App() {
  const [unlocked, setUnlocked] = useState<boolean>(() => isSessionUnlocked());
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem(THEME_KEY) === 'dark');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [dataset, setDataset] = useState<AppDataset>({ customers: [], items: [] });
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals & Drawers
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<RepairOrder | null>(null);
  const [preselectedCustomer, setPreselectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<RepairOrder | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    ensurePinInitialized();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  const loadData = useCallback(
    async (activeSettings: AppSettings, silent = false) => {
      setSyncing(true);
      try {
        const data = await fetchAllData(activeSettings);
        setDataset(data);
        if (!silent) {
          showToast(
            'success',
            activeSettings.mode === 'sheets'
              ? 'Đã đồng bộ dữ liệu từ Google Sheets.'
              : 'Đã tải dữ liệu cục bộ.'
          );
        }
      } catch (err) {
        showToast(
          'error',
          err instanceof Error ? err.message : 'Lỗi tải dữ liệu từ Google Sheets.'
        );
      } finally {
        setSyncing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (unlocked) {
      loadData(settings, true);
    }
  }, [unlocked, settings, loadData]);

  const orderCount = useMemo(() => groupItemsIntoOrders(dataset.items).length, [dataset.items]);
  const selectedCustomer = useMemo(
    () => dataset.customers.find((c) => c.id === selectedCustomerId) || null,
    [dataset.customers, selectedCustomerId]
  );

  const handleOpenNewOrder = (customer: Customer | null = null) => {
    setEditingOrder(null);
    setPreselectedCustomer(customer);
    setOrderModalOpen(true);
  };

  const handleEditOrder = (order: RepairOrder) => {
    setPreselectedCustomer(null);
    setEditingOrder(order);
    setOrderModalOpen(true);
  };

  const handleOrderSubmit = async (payload: {
    isEdit: boolean;
    maDonHang: string;
    customer: Customer;
    items: RepairItem[];
  }) => {
    setSaving(true);
    try {
      const next = payload.isEdit
        ? await updateOrderInStorage(settings, payload.maDonHang, payload.customer, payload.items)
        : await createOrderInStorage(settings, payload.customer, payload.items);
      setDataset(next);
      setOrderModalOpen(false);
      showToast(
        'success',
        payload.isEdit
          ? `Đã cập nhật đơn ${payload.maDonHang}.`
          : `Đã tạo đơn mới ${payload.maDonHang} (${payload.items.length} linh kiện).`
      );
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể lưu đơn hàng.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (order: RepairOrder) => {
    const confirmed = window.confirm(
      `Xóa đơn ${order.maDonHang} của khách hàng ${order.tenKhachHang}?`
    );
    if (!confirmed) return;
    try {
      const next = await deleteOrderInStorage(settings, order.maDonHang);
      setDataset(next);
      showToast('success', `Đã xóa đơn ${order.maDonHang}.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể xóa đơn hàng.');
    }
  };

  const handleUpdateCustomer = async (customer: Customer) => {
    try {
      const next = await upsertCustomerInStorage(settings, customer);
      setDataset(next);
      showToast('success', 'Đã cập nhật thông tin khách hàng.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể cập nhật khách hàng.');
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`Xóa hồ sơ khách hàng ${customer.tenKhachHang}?`)) return;
    try {
      const next = await deleteCustomerInStorage(settings, customer.id);
      setDataset(next);
      setSelectedCustomerId(null);
      showToast('success', `Đã xóa khách hàng ${customer.tenKhachHang}.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể xóa khách hàng.');
    }
  };

  const handleSaveSettings = async (next: AppSettings) => {
    saveSettings(next);
    setSettings(next);
    showToast('success', 'Đã lưu cài đặt hệ thống.');
  };

  const handleClearDemo = () => {
    const empty = clearDemoData();
    setDataset(empty);
    showToast('success', 'Đã xóa dữ liệu mẫu cục bộ.');
  };

  const handleLock = () => {
    lockSession();
    setUnlocked(false);
  };

  if (!unlocked) {
    return <LockScreen onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        storageMode={settings.mode}
        syncing={syncing}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onSync={() => loadData(settings, false)}
        onOpenNewOrder={() => handleOpenNewOrder(null)}
        onOpenSettings={() => setSettingsOpen(true)}
        onLock={handleLock}
        orderCount={orderCount}
        customerCount={dataset.customers.length}
      >
        {activeTab === 'orders' ? (
          <OrderListView
            items={dataset.items}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onPrintOrder={(order) => setPrintingOrder(order)}
            onSelectCustomer={(cid) => setSelectedCustomerId(cid)}
            onCreateOrder={() => handleOpenNewOrder(null)}
          />
        ) : (
          <CustomerListView
            customers={dataset.customers}
            items={dataset.items}
            onSelectCustomer={(cid) => setSelectedCustomerId(cid)}
            onAddOrderForCustomer={(c) => handleOpenNewOrder(c)}
          />
        )}
      </Layout>

      {/* Modals & Drawer */}
      <OrderFormModal
        open={orderModalOpen}
        customers={dataset.customers}
        editingOrder={editingOrder}
        preselectedCustomer={preselectedCustomer}
        saving={saving}
        onClose={() => setOrderModalOpen(false)}
        onSubmit={handleOrderSubmit}
      />

      <CustomerDetailDrawer
        customer={selectedCustomer}
        items={dataset.items}
        onClose={() => setSelectedCustomerId(null)}
        onAddOrder={(c) => {
          setSelectedCustomerId(null);
          handleOpenNewOrder(c);
        }}
        onPrintOrder={(order) => setPrintingOrder(order)}
        onEditOrder={(order) => {
          setSelectedCustomerId(null);
          handleEditOrder(order);
        }}
        onUpdateCustomer={handleUpdateCustomer}
        onDeleteCustomer={handleDeleteCustomer}
      />

      <WarrantyPrintModal
        order={printingOrder}
        shopInfo={settings.shopInfo}
        onClose={() => setPrintingOrder(null)}
      />

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSaveSettings={handleSaveSettings}
        onClearDemoData={handleClearDemo}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="no-print fixed bottom-5 right-5 z-50 max-w-sm">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white dark:bg-blue-600'
                : 'bg-rose-600 text-white'
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </>
  );
}
