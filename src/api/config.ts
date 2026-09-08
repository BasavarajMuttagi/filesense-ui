export const DEFAULT_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8787";

export const CLERK_PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) || "";

const STORAGE_KEY_BASE_URL = "filesense_api_base_url";
const STORAGE_KEY_DEV_TOKEN = "filesense_dev_token";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem(STORAGE_KEY_BASE_URL);
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, "");
    }
  }
  return DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string | null): void {
  if (typeof window === "undefined") return;
  if (!url || url.trim() === "" || url.trim() === DEFAULT_API_BASE_URL) {
    localStorage.removeItem(STORAGE_KEY_BASE_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_BASE_URL, url.trim().replace(/\/+$/, ""));
  }
}

export function getDevToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_DEV_TOKEN);
}

export function setDevToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (!token || token.trim() === "") {
    localStorage.removeItem(STORAGE_KEY_DEV_TOKEN);
  } else {
    localStorage.setItem(STORAGE_KEY_DEV_TOKEN, token.trim());
  }
}
