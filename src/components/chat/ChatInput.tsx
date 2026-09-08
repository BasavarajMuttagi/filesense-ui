import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { UploadProgress } from "@tigrisdata/storage/client";
import { uploadFile } from "../../api/upload";
import type { Project } from "../../types";
import {
  Paperclip,
  ArrowUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface ChatInputProps {
  activeProject: Project | null;
  onSendMessage: (question: string) => void;
  onDocumentUploaded?: () => void;
  onOpenNewProjectModal: () => void;
  loading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  activeProject,
  onSendMessage,
  onDocumentUploaded,
  onOpenNewProjectModal,
  loading,
  placeholder = "Ask anything about your project documents...",
}) => {
  const { getToken } = useAuth();
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadSuccessName, setUploadSuccessName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || loading || isUploading) return;
    onSendMessage(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!activeProject) {
      onOpenNewProjectModal();
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadSuccessName(null);
    setUploadFileName(file.name);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const token = await getToken();
      await uploadFile(
        { projectId: activeProject.id, file, token },
        (p) => {
          setUploadProgress(p);
        }
      );

      // Upload finished: dismiss progress bar and display single success indicator
      setIsUploading(false);
      setUploadProgress(null);
      setUploadFileName(null);
      setUploadSuccessName(file.name);
      onDocumentUploaded?.();

      setTimeout(() => {
        setUploadSuccessName(null);
      }, 2500);
    } catch (err: unknown) {
      console.error("Upload failed:", err);
      const rawMsg = err instanceof Error ? err.message : "Failed to upload file.";
      setErrorMessage(rawMsg);
      setIsUploading(false);
      setUploadProgress(null);
      setUploadFileName(null);
      setUploadSuccessName(null);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (file) handleFileUpload(file);
  };

  return (
    <div className="w-full flex flex-col gap-2 font-sans">
      {/* Tiimo Soft Rounded Card Input */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`p-4 bg-white border rounded-3xl transition-all duration-150 shadow-xs ${
          isDragging
            ? "border-[#7C5CFC] ring-3 ring-[#7C5CFC]/20 bg-[#F5F2FF]/40"
            : "border-[#16161314] hover:border-[#16161324] focus-within:border-[#161613] focus-within:ring-3 focus-within:ring-[#7C5CFC]/15"
        }`}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onFileSelect}
          accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          aria-label="Ask a question"
          className="w-full resize-none bg-transparent text-sm text-[#161613] placeholder:text-[#16161366] focus:outline-none leading-relaxed min-h-[44px]"
        />

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Left: Attach Document Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!activeProject) {
                  onOpenNewProjectModal();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              disabled={isUploading}
              aria-label="Attach file"
              title="Attach document to project"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#16161399] hover:text-[#161613] hover:bg-[#16161308] rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              <Paperclip className="size-3.5" />
              <span>Attach</span>
            </button>
          </div>

          {/* Right: Send Message Button - Tiimo obsidian circle button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || loading || isUploading}
            aria-label="Send message"
            className="size-8.5 rounded-full bg-[#161613] hover:bg-[#282824] disabled:bg-[#16161312] disabled:text-[#16161340] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed active:scale-95 hover:scale-[1.03]"
          >
            {loading || isUploading ? (
              <Loader2 className="size-4 animate-spin text-[#161613]" />
            ) : (
              <ArrowUp className="size-4 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Upload Progress Banner (ONLY while actively uploading) */}
        {isUploading && (
          <div className="mt-2 flex items-center justify-between text-xs text-[#161613b3] bg-[#FAF9F6] px-3 py-2 rounded-2xl">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="size-3.5 animate-spin text-[#7C5CFC]" />
              <span className="truncate">Uploading {uploadFileName || "file"}...</span>
            </div>
            {uploadProgress && (
              <span className="font-mono text-[#7C5CFC] font-semibold bg-[#E2DAFF]/60 px-2 py-0.5 rounded-full text-[11px] shrink-0">
                {uploadProgress.percentage}%
              </span>
            )}
          </div>
        )}

        {/* Upload Success indicator (ONLY after upload finishes, never stacked) */}
        {!isUploading && uploadSuccessName && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-[#E8F8ED] px-3 py-2 rounded-2xl animate-in fade-in duration-150">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span className="truncate">Uploaded {uploadSuccessName}</span>
          </div>
        )}
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3 bg-[#FFF0ED] border border-[#FFD3C4] rounded-2xl text-[#C53030] flex items-center gap-2 text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
