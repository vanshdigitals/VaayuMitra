/**
 * Anonymous device identity: a random id stored in localStorage.
 * Lets us persist a user's history without any login or personal data.
 */
const STORAGE_KEY = "vaayumitra_device_id";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `vm-${crypto.randomUUID().replace(/-/g, "")}`;
  }
  // Fallback for environments without crypto.randomUUID
  return `vm-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/** Return the persistent anonymous device id, creating one if needed. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr-placeholder";
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage unavailable (e.g. private mode) — use an ephemeral id.
    return generateId();
  }
}
