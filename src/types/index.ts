export type DocumentStatus = "created" | "processing" | "processed" | "error";

export interface Project {
  id: string;
  userId?: string;
  title: string;
  description: string | null;
  createdAt: string | number;
  updatedAt?: string | number;
  documentCount?: number;
  documents?: DocumentItem[];
}

export interface DocumentItem {
  id: string;
  projectId: string;
  title?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageUrl?: string | null;
  chunkCount?: number;
  status: DocumentStatus;
  createdAt: string | number;
  updatedAt?: string | number;
}

export interface SourceItem {
  title: string;
  fileName: string;
  chunkIndex?: number;
  text: string;
  score: number;
  pageStart?: number | null;
  pageEnd?: number | null;
}

export interface QueryRecord {
  id: string;
  userId?: string;
  projectId?: string | null;
  question: string;
  answer: string | null;
  sources?: SourceItem[] | null;
  createdAt: string | number;
  updatedAt?: string | number;
}

export interface UploadPresignedResponse {
  success: boolean;
  url?: string;
  storagePath: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
}
