import { apiClient } from "./client";
import type { HealthResponse } from "../types";

export interface HealthStatus {
  online: boolean;
  status: string;
  timestamp: string;
  latencyMs: number;
}

export async function checkHealth(): Promise<HealthStatus> {
  const start = performance.now();
  try {
    const res = await apiClient.get<HealthResponse>("/health", {
      timeout: 5000,
    });
    const latencyMs = Math.round(performance.now() - start);
    return {
      online: res.data.status === "ok",
      status: res.data.status,
      timestamp: res.data.timestamp,
      latencyMs,
    };
  } catch {
    const latencyMs = Math.round(performance.now() - start);
    return {
      online: false,
      status: "unreachable",
      timestamp: new Date().toISOString(),
      latencyMs,
    };
  }
}
