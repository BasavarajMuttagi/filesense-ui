import { z } from "zod";
import { uploadToSignedUrl, type UploadProgress, type UploadResponse } from "@tigrisdata/storage/client";
import { getApiBaseUrl, getDevToken } from "./config";

export const uploadSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  file: z.instanceof(File, { message: "Valid file is required" }),
  token: z.string().nullable().optional(),
});

export type UploadInput = z.infer<typeof uploadSchema>;

const presignedResponseSchema = z.object({
  url: z.string().min(1, "Presigned upload URL is required"),
  storagePath: z.string().optional(),
});

/**
 * 1. Obtains presigned upload URL from Worker using Clerk Authorization header
 * 2. Uploads file directly to Tigris storage using client SDK uploadToSignedUrl (single-part PUT)
 */
export async function uploadFile(
  input: UploadInput,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResponse> {
  const { projectId, file, token } = uploadSchema.parse(input);
  const effectiveToken = token || getDevToken();

  // 1. Fetch presigned URL with Clerk Bearer token
  const response = await fetch(`${getApiBaseUrl()}/api/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
    },
    body: JSON.stringify({
      projectId,
      name: file.name,
      action: "singlepart-init",
      operation: "put",
      contentType: file.type || "application/octet-stream",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Upload authorization failed with status ${response.status}`);
  }

  const rawJson = await response.json();
  const rawUrl = rawJson.url || rawJson.data?.url;
  const { url } = presignedResponseSchema.parse({
    url: rawUrl,
    storagePath: rawJson.storagePath,
  });

  // 2. Direct single-part upload to Tigris S3 using Tigris Client SDK
  const result = await uploadToSignedUrl(
    file.name,
    file,
    {
      method: "PUT",
      url,
      expiresIn: 3600,
    },
    {
      contentType: file.type || "application/octet-stream",
      onUploadProgress: onProgress,
    },
  );

  if (result.error) {
    throw result.error;
  }

  return result.data;
}
