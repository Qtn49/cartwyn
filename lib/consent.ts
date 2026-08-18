// Gestion du consentement cookies (RGPD). C'est le seul usage autorisé de
// localStorage sur ce site : aucune autre donnée n'y est stockée.

export type ConsentCategories = {
  analytics: boolean;
  chat: boolean;
};

export type ConsentState = ConsentCategories & {
  decided: boolean;
};

const STORAGE_KEY = "cartwyn-consent";

export const defaultConsent: ConsentState = {
  decided: false,
  analytics: false,
  chat: false,
};

function computeFromStorage(): ConsentState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConsent;
    const parsed = JSON.parse(raw);
    return { ...defaultConsent, ...parsed, decided: true };
  } catch {
    return defaultConsent;
  }
}

let cache: ConsentState = defaultConsent;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  cache = computeFromStorage();
  initialized = true;
}

// À utiliser via le hook useConsent (useSyncExternalStore) plutôt que
// directement, pour rester synchronisé avec le stockage entre onglets.
export function getConsentSnapshot(): ConsentState {
  ensureInitialized();
  return cache;
}

export function getServerConsentSnapshot(): ConsentState {
  return defaultConsent;
}

export function subscribeConsent(callback: () => void) {
  ensureInitialized();
  listeners.add(callback);
  function handleStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) {
      cache = computeFromStorage();
      callback();
    }
  }
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function writeConsent(categories: ConsentCategories) {
  if (typeof window === "undefined") return;
  const state: ConsentState = { ...categories, decided: true };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  cache = state;
  listeners.forEach((listener) => listener());
}
