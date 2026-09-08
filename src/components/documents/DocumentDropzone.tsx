import React, { useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { UploadProgress } from "@tigrisdata/storage/client";
import { uploadFile } from "../../api/upload";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

interface DocumentDropzoneProps {
  projectId: string;
  onUploadSuccess: () => void;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  projectId,
  onUploadSuccess,
}) => {
  const { getToken } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successFile, setSuccessFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessFile(null);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const token = await getToken();
      const res = await uploadFile(
        { projectId, file, token },
        (p) => setProgress(p)
      );

      setSuccessFile(res.name || file.name);
      setTimeout(() => {
        setIsUploading(false);
        setProgress(null);
        onUploadSuccess();
      }, 1200);
    } catch (err: unknown) {
      console.error("Upload failed:", err);
      const rawMsg = err instanceof Error ? err.message : "Failed to upload document.";
      if (rawMsg.includes("network error")) {
        setErrorMessage(
          "Upload failed due to network error. Please ensure CORS is enabled for http://localhost:5173 on your storage bucket."
        );
      } else {
        setErrorMessage(rawMsg);
      }
      setIsUploading(false);
      setProgress(null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full flex flex-col gap-2 font-sans">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed transition-all duration-150 p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none rounded-3xl ${
          isDragging
            ? "border-[#7C5CFC] bg-[#F5F2FF]/60 ring-4 ring-[#7C5CFC]/15"
            : "border-[#16161318] bg-white hover:border-[#7C5CFC] hover:bg-[#F5F2FF]/30"
        } ${isUploading ? "pointer-events-none opacity-90" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onFileSelect}
          accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
        />

        {isUploading ? (
          <div className="w-full max-w-xs flex flex-col items-center gap-3 py-1">
            <div className="size-6 border-2 border-[#7C5CFC] border-t-transparent animate-spin rounded-full" />
            <div className="text-xs font-semibold text-[#161613]">
              Streaming to storage &amp; vector index...
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#1616130d] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#7C5CFC] h-full transition-all duration-150 rounded-full"
                style={{ width: `${progress ? Math.max(5, progress.percentage) : 10}%` }}
              />
            </div>
            <div className="text-xs text-[#16161380] font-mono">
              {progress
                ? `${progress.percentage}% · ${formatBytes(progress.loaded)} of ${formatBytes(progress.total)}`
                : "Preparing chunk ingestion..."}
            </div>
          </div>
        ) : successFile ? (
          <div className="flex flex-col items-center gap-1.5 text-[#136C40] py-1">
            <div className="size-9 rounded-full bg-[#D8F3E5] flex items-center justify-center text-[#136C40]">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="text-xs font-bold text-[#161613]">
              Uploaded: {successFile}
            </div>
            <p className="text-[11px] text-[#16161380] font-mono">
              Document chunks indexed successfully
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div className="size-11 bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center rounded-2xl shadow-2xs">
              <UploadCloud className="size-5.5" />
            </div>
            <div className="text-xs font-medium text-[#161613]">
              Drop documents here, or <span className="text-[#7C5CFC] font-semibold underline underline-offset-2">browse</span>
            </div>
            <p className="text-[10px] text-[#16161366] font-mono uppercase tracking-wider">
              PDF, TXT, DOCX, Code, &amp; Images
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-[#FFF0ED] border border-[#FFD3C4] text-[#C53030] flex items-center gap-2 text-xs rounded-2xl">
          <AlertCircle className="size-4 shrink-0 text-[#C53030]" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
