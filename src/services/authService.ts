const PIN_HASH_KEY = 'conic_pin_hash_v2';
const LEGACY_PIN_HASH_KEY = 'conic_pin_hash_v1';
const SESSION_UNLOCK_KEY = 'conic_session_unlocked_v2';
const DEFAULT_PIN_SHA256 = '64afa61700a39ef1a15628aa8c1fa496483fd6b15124ff93b21fbfc65e782ffb';

async function sha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback đơn giản cho môi trường không hỗ trợ WebCrypto
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `fallback_${hash}`;
}

export async function ensurePinInitialized(): Promise<void> {
  if (localStorage.getItem(LEGACY_PIN_HASH_KEY)) {
    localStorage.removeItem(LEGACY_PIN_HASH_KEY);
    localStorage.removeItem('conic_pin_customized_v1');
  }
  if (!localStorage.getItem(PIN_HASH_KEY)) {
    localStorage.setItem(PIN_HASH_KEY, DEFAULT_PIN_SHA256);
  }
}

export function isUsingDefaultPinHint(): boolean {
  return false;
}

export async function verifyPin(inputPin: string): Promise<boolean> {
  await ensurePinInitialized();
  const stored = localStorage.getItem(PIN_HASH_KEY);
  const candidate = await sha256(inputPin.trim());
  const ok = stored === candidate;
  if (ok) {
    sessionStorage.setItem(SESSION_UNLOCK_KEY, '1');
  }
  return ok;
}

export async function changePin(currentPin: string, newPin: string): Promise<{ ok: boolean; error?: string }> {
  if (newPin.trim().length < 4) {
    return { ok: false, error: 'Mã PIN / mật khẩu mới cần tối thiểu 4 ký tự.' };
  }
  const valid = await verifyPin(currentPin);
  if (!valid) {
    return { ok: false, error: 'Mã PIN / mật khẩu hiện tại không đúng.' };
  }
  const newHash = await sha256(newPin.trim());
  localStorage.setItem(PIN_HASH_KEY, newHash);
  localStorage.setItem('conic_pin_customized_v1', '1');
  return { ok: true };
}

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_UNLOCK_KEY) === '1';
}

export function lockSession(): void {
  sessionStorage.removeItem(SESSION_UNLOCK_KEY);
}
