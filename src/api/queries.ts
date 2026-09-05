import { apiClient } from "./client";
import type { QueryRecord } from "../types";

export async function submitQuery(
  question: string,
  projectId?: string | null,
): Promise<QueryRecord> {
  const payload: { question: string; projectId?: string } = { question };
  if (projectId) {
    payload.projectId = projectId;
  }
  const res = await apiClient.post<QueryRecord>("/queries", payload);
  return res.data;
}

export async function listQueries(projectId?: string | null): Promise<QueryRecord[]> {
  const params: Record<string, string> = {};
  if (projectId) {
    params.projectId = projectId;
  }
  const res = await apiClient.get<{ queries: QueryRecord[] }>("/queries", { params });
  return res.data.queries || [];
}

export async function getQuery(id: string): Promise<QueryRecord> {
  const res = await apiClient.get<QueryRecord>(`/queries/${encodeURIComponent(id)}`);
  return res.data;
}
