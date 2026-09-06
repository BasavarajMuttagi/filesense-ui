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
    <div className="w-full flex flex-col gap-2">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed transition-all duration-150 p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none rounded-xs ${
          isDragging
            ? "border-[#E11D48] bg-rose-50/50"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50"
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
            <div className="w-7 h-7 border-2 border-slate-900 border-t-transparent animate-spin rounded-full" />
            <div className="text-xs font-semibold text-slate-800 font-sans">
              Uploading file...
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E11D48] h-full transition-all duration-150 rounded-full"
                style={{ width: `${progress ? Math.max(5, progress.percentage) : 10}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 font-sans">
              {progress
                ? `${progress.percentage}% · ${formatBytes(progress.loaded)} of ${formatBytes(progress.total)}`
                : "Preparing upload..."}
            </div>
          </div>
        ) : successFile ? (
          <div className="flex flex-col items-center gap-2 text-emerald-700 py-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            <div className="text-xs font-semibold text-slate-900 font-sans">
              Upload complete: {successFile}
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Indexing document into vector search...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 bg-slate-100 flex items-center justify-center text-slate-600 rounded-full">
              <UploadCloud className="w-5 h-5 text-slate-600" />
            </div>
            <div className="text-xs font-semibold text-slate-800 font-sans">
              Drop documents here, or <span className="text-[#E11D48] underline">browse</span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Supports PDF, TXT, DOCX, and images
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs font-sans rounded-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
