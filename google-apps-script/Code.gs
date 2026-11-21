/**
 * ConicComputer — Google Apps Script Backend API
 *
 * Hướng dẫn nhanh:
 * 1. Mở Google Sheet của bạn -> Tiện ích mở rộng -> Apps Script.
 * 2. Xóa toàn bộ code mẫu và dán toàn bộ nội dung file này vào.
 * 3. Đổi giá trị SECRET_KEY bên dưới thành mã bí mật của riêng bạn.
 * 4. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới -> Ứng dụng web (Web App):
 *    - Thực thi với tư cách: Tôi (Me)
 *    - Ai có quyền truy cập: Bất kỳ ai (Anyone)
 * 5. Sao chép URL ứng dụng web và dán vào mục Cài đặt trên website ConicComputer.
 */

const SECRET_KEY = 'CONIC_SECRET_2026';

const SHEET_CUSTOMERS = 'KhachHang';
const SHEET_ITEMS = 'LichSuThayThe';

const CUSTOMER_HEADERS = [
  'id',
  'tenKhachHang',
  'soDienThoai',
  'ghiChu',
  'ngayTao',
];

const ITEM_HEADERS = [
  'id',
  'maDonHang',
  'khachHangId',
  'tenKhachHang',
  'soDienThoai',
  'tenMay',
  'matHangThay',
  'soTien',
  'ngayThay',
  'baoHanhThang',
  'ngayHetBaoHanh',
  'ghiChu',
];

function doGet() {
  return jsonResponse({
    ok: true,
    service: 'ConicComputer Google Sheets API',
    message: 'API đang hoạt động. Vui lòng gửi POST kèm secretKey.',
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const body = JSON.parse(raw);

    if (!body || body.secret !== SECRET_KEY) {
      return jsonResponse({ ok: false, error: 'Sai Secret Key. Vui lòng kiểm tra lại cấu hình.' });
    }

    const action = body.action;
    const payload = body.payload || {};

    switch (action) {
      case 'ping':
        return jsonResponse({ ok: true, message: 'Kết nối Google Sheets thành công!' });

      case 'initSheets':
        ensureSheets();
        return jsonResponse({ ok: true, message: 'Đã khởi tạo 2 bảng KhachHang và LichSuThayThe.' });

      case 'getAll':
        ensureSheets();
        return jsonResponse({
          ok: true,
          data: {
            customers: readSheetObjects(SHEET_CUSTOMERS, CUSTOMER_HEADERS),
            items: readSheetObjects(SHEET_ITEMS, ITEM_HEADERS).map(normalizeItemRow),
          },
        });

      case 'createOrder':
        ensureSheets();
        return jsonResponse({ ok: true, data: handleCreateOrder(payload) });

      case 'updateOrder':
        ensureSheets();
        return jsonResponse({ ok: true, data: handleUpdateOrder(payload) });

      case 'deleteOrder':
        ensureSheets();
        handleDeleteOrder(payload.maDonHang);
        return jsonResponse({ ok: true });

      case 'deleteItem':
        ensureSheets();
        deleteRowByColumnValue(SHEET_ITEMS, 1, payload.id);
        return jsonResponse({ ok: true });

      case 'upsertCustomer':
        ensureSheets();
        return jsonResponse({ ok: true, data: handleUpsertCustomer(payload) });

      case 'deleteCustomer':
        ensureSheets();
        deleteRowByColumnValue(SHEET_CUSTOMERS, 1, payload.id);
        return jsonResponse({ ok: true });

      default:
        return jsonResponse({ ok: false, error: 'Action không hợp lệ: ' + action });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function ensureSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let customerSheet = ss.getSheetByName(SHEET_CUSTOMERS);
  if (!customerSheet) {
    customerSheet = ss.insertSheet(SHEET_CUSTOMERS);
  }
  if (customerSheet.getLastRow() === 0) {
    customerSheet.appendRow(CUSTOMER_HEADERS);
    formatHeaderRow(customerSheet, CUSTOMER_HEADERS.length);
    customerSheet.getRange('C:C').setNumberFormat('@');
  }

  let itemSheet = ss.getSheetByName(SHEET_ITEMS);
  if (!itemSheet) {
    itemSheet = ss.insertSheet(SHEET_ITEMS);
  }
  if (itemSheet.getLastRow() === 0) {
    itemSheet.appendRow(ITEM_HEADERS);
    formatHeaderRow(itemSheet, ITEM_HEADERS.length);
    itemSheet.getRange('E:E').setNumberFormat('@');
    itemSheet.getRange('H:H').setNumberFormat('#,##0');
  }
}

function formatHeaderRow(sheet, numCols) {
  const headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange
    .setFontWeight('bold')
    .setBackground('#0f172a')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
}

function readSheetObjects(sheetName, headers) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues();
  return values
    .filter(function (row) {
      return row.some(function (cell) {
        return String(cell).trim() !== '';
      });
    })
    .map(function (row) {
      const obj = {};
      headers.forEach(function (h, idx) {
        obj[h] = row[idx] !== undefined ? String(row[idx]).trim() : '';
      });
      return obj;
    });
}

function normalizeItemRow(row) {
  return {
    id: row.id,
    maDonHang: row.maDonHang,
    khachHangId: row.khachHangId,
    tenKhachHang: row.tenKhachHang,
    soDienThoai: row.soDienThoai,
    tenMay: row.tenMay,
    matHangThay: row.matHangThay,
    soTien: Number(String(row.soTien).replace(/[^\d.-]/g, '')) || 0,
    ngayThay: row.ngayThay,
    baoHanhThang: Number(row.baoHanhThang) || 0,
    ngayHetBaoHanh: row.ngayHetBaoHanh,
    ghiChu: row.ghiChu,
  };
}

function handleUpsertCustomer(customer) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CUSTOMERS);
  const rowIndex = findRowIndexByValue(sheet, 1, customer.id);
  const rowValues = [
    customer.id,
    customer.tenKhachHang || '',
    "'" + String(customer.soDienThoai || '').trim(),
    customer.ghiChu || '',
    customer.ngayTao || '',
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, CUSTOMER_HEADERS.length).setValues([rowValues]);
    // Đồng bộ tên & SĐT sang LichSuThayThe để dữ liệu nhất quán
    syncCustomerInfoToItems(customer);
  } else {
    sheet.appendRow(rowValues);
  }
  return customer;
}

function syncCustomerInfoToItems(customer) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
  if (!sheet || sheet.getLastRow() <= 1) return;
  const lastRow = sheet.getLastRow();
  const khIds = sheet.getRange(2, 3, lastRow - 1, 1).getDisplayValues();
  khIds.forEach(function (r, idx) {
    if (String(r[0]).trim() === String(customer.id).trim()) {
      sheet.getRange(idx + 2, 4, 1, 2).setValues([
        [customer.tenKhachHang || '', "'" + String(customer.soDienThoai || '').trim()],
      ]);
    }
  });
}

function handleCreateOrder(payload) {
  if (payload.customer) {
    handleUpsertCustomer(payload.customer);
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
  const items = payload.items || [];
  if (items.length > 0) {
    const rows = items.map(itemToRow);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, ITEM_HEADERS.length).setValues(rows);
  }
  return payload;
}

function handleUpdateOrder(payload) {
  if (payload.customer) {
    handleUpsertCustomer(payload.customer);
  }
  handleDeleteOrder(payload.maDonHang);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
  const items = payload.items || [];
  if (items.length > 0) {
    const rows = items.map(itemToRow);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, ITEM_HEADERS.length).setValues(rows);
  }
  return payload;
}

function handleDeleteOrder(maDonHang) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
  if (!sheet || sheet.getLastRow() <= 1) return;
  const values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]).trim() === String(maDonHang).trim()) {
      sheet.deleteRow(i + 2);
    }
  }
}

function deleteRowByColumnValue(sheetName, colIndex, targetValue) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return;
  const values = sheet.getRange(2, colIndex, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]).trim() === String(targetValue).trim()) {
      sheet.deleteRow(i + 2);
    }
  }
}

function findRowIndexByValue(sheet, colIndex, targetValue) {
  if (!sheet || sheet.getLastRow() <= 1) return -1;
  const values = sheet.getRange(2, colIndex, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(targetValue).trim()) {
      return i + 2;
    }
  }
  return -1;
}

function itemToRow(item) {
  return [
    item.id,
    item.maDonHang,
    item.khachHangId,
    item.tenKhachHang || '',
    "'" + String(item.soDienThoai || '').trim(),
    item.tenMay || '',
    item.matHangThay || '',
    Number(item.soTien) || 0,
    item.ngayThay || '',
    Number(item.baoHanhThang) || 0,
    item.ngayHetBaoHanh || '',
    item.ghiChu || '',
  ];
}
