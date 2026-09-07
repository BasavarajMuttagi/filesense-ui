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
          setUploadStatus(`Uploading ${file.name} (${p.percentage}%)...`);
        }
      );

      setUploadStatus(`✓ Added ${file.name}`);
      onDocumentUploaded();

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(null);
        setUploadStatus(null);
      }, 2000);
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
      {/* Modern Card-based Chat Input */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`p-3.5 bg-white border border-zinc-200/90 shadow-xs rounded-2xl transition-all duration-150 ${
          isDragging ? "ring-2 ring-zinc-900 bg-zinc-50" : "hover:border-zinc-300"
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
          className="w-full resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none leading-relaxed"
        />

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-zinc-100">
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
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Paperclip className="size-3.5" />
              <span>Attach</span>
            </button>
          </div>

          {/* Right: Send Message Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || loading || isUploading}
            aria-label="Send message"
            className="size-8 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:cursor-not-allowed"
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
          <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="size-3.5 animate-spin text-zinc-500" />
              <span className="truncate">{uploadStatus}</span>
            </div>
            {uploadProgress && (
              <span className="font-mono text-zinc-500 shrink-0">
                {uploadProgress.percentage}%
              </span>
            )}
          </div>
        )}

        {/* Upload Success indicator */}
        {uploadStatus?.startsWith("✓") && (
          <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-xs text-emerald-600">
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
