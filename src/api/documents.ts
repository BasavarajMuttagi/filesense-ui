import { apiClient } from "./client";
import type { DocumentItem } from "../types";

export async function getDocumentsByProject(projectId: string): Promise<DocumentItem[]> {
  const res = await apiClient.get<{ documents: DocumentItem[] }>(
    `/documents/project/${encodeURIComponent(projectId)}`,
  );
  return res.data.documents || [];
}

export async function getDocument(id: string): Promise<DocumentItem> {
  const res = await apiClient.get<DocumentItem>(
    `/documents/${encodeURIComponent(id)}`,
  );
  return res.data;
}

export async function deleteDocument(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(
    `/documents/${encodeURIComponent(id)}`,
  );
  return res.data;
}
