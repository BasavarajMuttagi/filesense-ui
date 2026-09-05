import { apiClient } from "./client";
import type { Project } from "../types";

export async function getProjects(): Promise<Project[]> {
  const res = await apiClient.get<{ projects: Project[] }>("/projects");
  return res.data.projects || [];
}

export async function getProject(id: string): Promise<Project> {
  const res = await apiClient.get<Project>(`/projects/${encodeURIComponent(id)}`);
  return res.data;
}

export async function createProject(data: {
  title: string;
  description?: string;
}): Promise<Project> {
  const res = await apiClient.post<Project>("/projects", data);
  return res.data;
}

export async function deleteProject(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(
    `/projects/${encodeURIComponent(id)}`,
  );
  return res.data;
}
