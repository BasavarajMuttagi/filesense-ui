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
  onDocumentUploaded: () => void;
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
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
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
    setUploadStatus(`Uploading ${file.name}...`);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const token = await getToken();
      await uploadFile(
        { projectId: activeProject.id, file, token },
        (p) => {
          setUploadProgress(p);
          setUploadStatus(`Indexing ${file.name} (${p.percentage}%)...`);
        }
      );

      setUploadStatus(`✓ Indexed ${file.name}`);
      onDocumentUploaded();

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(null);
        setUploadStatus(null);
      }, 2200);
    } catch (err: unknown) {
      console.error("Upload failed:", err);
      const rawMsg = err instanceof Error ? err.message : "Failed to upload file.";
      setErrorMessage(rawMsg);
      setIsUploading(false);
      setUploadProgress(null);
      setUploadStatus(null);
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
      {/* Modern Card-based Swiss Chat Input */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`p-3.5 bg-white border rounded-2xl transition-all duration-150 shadow-xs ${
          isDragging
            ? "border-[#0052FF] ring-2 ring-[#0052FF]/20 bg-blue-50/30"
            : "border-slate-200 hover:border-slate-300 focus-within:border-[#0052FF] focus-within:ring-2 focus-within:ring-[#0052FF]/10"
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
          className="w-full resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed"
        />

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100">
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
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Paperclip className="size-3.5" />
              <span>Attach</span>
            </button>

            {activeProject && (
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Indexed to {activeProject.title}
              </span>
            )}
          </div>

          {/* Right: Send Message Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || loading || isUploading}
            aria-label="Send message"
            className="size-8 rounded-full bg-[#0052FF] hover:bg-[#0045D8] disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed active:scale-95"
          >
            {loading || isUploading ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </button>
        </div>

        {/* Upload Progress Banner */}
        {isUploading && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="size-3.5 animate-spin text-[#0052FF]" />
              <span className="truncate">{uploadStatus}</span>
            </div>
            {uploadProgress && (
              <span className="font-mono text-[#0052FF] font-semibold shrink-0">
                {uploadProgress.percentage}%
              </span>
            )}
          </div>
        )}

        {/* Upload Success indicator */}
        {uploadStatus?.startsWith("✓") && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
