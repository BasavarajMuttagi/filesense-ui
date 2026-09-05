import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl, getDevToken } from "./config";

let authTokenGetter: (() => Promise<string | null>) | null = null;

export function registerAuthTokenGetter(fn: () => Promise<string | null>) {
  authTokenGetter = fn;
}

export function createApiClient(): AxiosInstance {
  const instance = axios.create({
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 60000, // 60s for RAG LLM queries and box operations
  });

  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();

    let token: string | null = null;

    // 1. Try dev token override first
    const devToken = getDevToken();
    if (devToken) {
      token = devToken;
    } else if (authTokenGetter) {
      // 2. Fall back to Clerk JWT
      try {
        token = await authTokenGetter();
      } catch (err) {
        console.warn("Failed to retrieve Clerk JWT token:", err);
      }
    }

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "An unexpected network error occurred";
      return Promise.reject(new Error(message));
    },
  );

  return instance;
}

export const apiClient = createApiClient();
