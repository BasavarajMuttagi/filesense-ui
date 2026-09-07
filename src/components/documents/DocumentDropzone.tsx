import { useState, useRef } from "react";
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
        className={`border-2 border-dashed transition-all duration-150 p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none rounded-2xl ${
          isDragging
            ? "border-zinc-900 bg-zinc-50"
            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/60"
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
          <div className="w-full max-w-md flex flex-col items-center gap-3 py-2">
            <div className="size-6 border-2 border-zinc-900 border-t-transparent animate-spin rounded-full" />
            <div className="text-xs font-semibold text-zinc-900 font-sans">
              Uploading document...
            </div>
            {/* Progress bar */}
            <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-zinc-900 h-full transition-all duration-150 rounded-full"
                style={{ width: `${progress ? Math.max(5, progress.percentage) : 10}%` }}
              />
            </div>
            <div className="text-xs text-zinc-400 font-sans">
              {progress
                ? `${progress.percentage}% · ${formatBytes(progress.loaded)} of ${formatBytes(progress.total)}`
                : "Preparing upload..."}
            </div>
          </div>
        ) : successFile ? (
          <div className="flex flex-col items-center gap-1.5 text-emerald-700 py-2">
            <CheckCircle2 className="size-6 text-emerald-600" />
            <div className="text-xs font-semibold text-zinc-900 font-sans">
              Uploaded: {successFile}
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Indexing document into vector search...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="size-9 bg-zinc-100 flex items-center justify-center text-zinc-600 rounded-xl shadow-2xs">
              <UploadCloud className="size-5 text-zinc-600" />
            </div>
            <div className="text-xs font-medium text-zinc-700 font-sans">
              Drop documents here, or <span className="text-zinc-950 font-semibold underline">browse</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              PDF, TXT, DOCX, and images
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-sans rounded-xl">
          <AlertCircle className="size-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
