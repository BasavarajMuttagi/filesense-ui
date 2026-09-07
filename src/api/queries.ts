import { apiClient, getAuthToken } from "./client";
import { getApiBaseUrl } from "./config";
import type { QueryRecord, QueryStreamOptions, ChatSession } from "../types";

export async function submitQuery(
  question: string,
  projectId?: string | null,
  sessionId?: string | null,
  history?: Array<{ role: "user" | "assistant"; content: string }>,
  systemInstruction?: string | null,
): Promise<QueryRecord> {
  const payload: {
    question: string;
    projectId?: string;
    sessionId?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    systemInstruction?: string;
  } = { question };
  if (projectId) payload.projectId = projectId;
  if (sessionId) payload.sessionId = sessionId;
  if (history && history.length > 0) payload.history = history;
  if (systemInstruction) payload.systemInstruction = systemInstruction;

  const res = await apiClient.post<QueryRecord>("/queries", payload);
  return res.data;
}

export async function submitQueryStream(options: QueryStreamOptions): Promise<void> {
  const { question, projectId, sessionId, history, systemInstruction, onSources, onToken, onDone, onError, signal } = options;
  const baseUrl = getApiBaseUrl();
  const token = await getAuthToken();

  const payload: Record<string, unknown> = {
    question,
    stream: true,
  };
  if (projectId) payload.projectId = projectId;
  if (sessionId) payload.sessionId = sessionId;
  if (history && history.length > 0) payload.history = history;
  if (systemInstruction) payload.systemInstruction = systemInstruction;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/queries`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      let errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        errorText = errJson.message || errJson.error || errorText;
      } catch {}
      throw new Error(errorText || `Query request failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No readable stream received from server");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let currentEvent = "message";
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
          currentEvent = "message";
          continue;
        }

        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const dataStr = line.slice(5).trim();
          if (!dataStr) continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (currentEvent === "sources" || parsed.type === "sources") {
              onSources?.(parsed.sources || parsed);
            } else if (currentEvent === "token" || parsed.type === "token") {
              onToken?.(parsed.text ?? "");
            } else if (currentEvent === "done" || parsed.type === "done") {
              onDone?.(parsed);
            }
          } catch {
            if (currentEvent === "token") {
              onToken?.(dataStr);
            }
          }
        }
      }
    }
  } catch (err: unknown) {
    if (signal?.aborted) return;
    const errorObj = err instanceof Error ? err : new Error(String(err));
    onError?.(errorObj);
    throw errorObj;
  }
}

export interface ListQueriesResponse {
  queries: QueryRecord[];
  hasMore: boolean;
  nextCursor: string | null;
}

export async function listQueries(
  projectId?: string | null,
  options?: { sessionId?: string | null; limit?: number; before?: string | number | null }
): Promise<ListQueriesResponse> {
  const params: Record<string, string> = {};
  if (projectId) {
    params.projectId = projectId;
  }
  if (options?.sessionId) {
    params.sessionId = options.sessionId;
  }
  if (options?.limit) {
    params.limit = String(options.limit);
  }
  if (options?.before) {
    params.before = String(options.before);
  }

  const res = await apiClient.get<{
    queries: QueryRecord[];
    hasMore?: boolean;
    nextCursor?: string | null;
  }>("/queries", { params });

  return {
    queries: res.data.queries || [],
    hasMore: res.data.hasMore ?? false,
    nextCursor: res.data.nextCursor ?? null,
  };
}

export async function listSessions(projectId: string): Promise<ChatSession[]> {
  const res = await apiClient.get<{ sessions: ChatSession[] }>("/queries/sessions", {
    params: { projectId },
  });
  return res.data.sessions || [];
}

export async function getQuery(id: string): Promise<QueryRecord> {
  const res = await apiClient.get<QueryRecord>(`/queries/${encodeURIComponent(id)}`);
  return res.data;
}
