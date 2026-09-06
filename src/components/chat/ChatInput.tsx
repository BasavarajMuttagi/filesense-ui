import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { UploadProgress } from "@tigrisdata/storage/client";
import { uploadFile } from "../../api/upload";
import type { Project } from "../../types";
import {
  Paperclip,
  ArrowUp,
  AlertCircle,
  Briefcase,
  CheckCircle2,
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
  placeholder = "Ask anything about your case files or documents...",
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
    <div className="w-full flex flex-col gap-2">
      {/* Search & Input Box */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border transition-all duration-150 bg-white shadow-xs rounded-xl flex flex-col p-3 ${
          isDragging
            ? "border-[#E11D48] ring-2 ring-rose-100 bg-rose-50/30"
            : "border-slate-300 focus-within:border-slate-900 focus-within:shadow-md"
        }`}
      >
        {/* Hidden file input for paperclip */}
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
          className="w-full p-1 text-sm font-sans text-slate-900 placeholder:text-slate-400 bg-transparent border-0 focus:outline-none resize-none leading-relaxed min-h-[44px]"
        />

        {/* Bottom bar of input */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
          {/* Left Actions: Attach File + Active Project Context */}
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer disabled:opacity-50"
              title={activeProject ? "Attach PDF or document to case" : "Create project first to attach files"}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="font-medium hidden sm:inline">Attach</span>
            </button>

            {activeProject ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full truncate max-w-[200px]">
                <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate font-sans font-medium">{activeProject.title}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenNewProjectModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#E11D48] hover:underline font-medium cursor-pointer"
              >
                + Select or create a case first
              </button>
            )}
          </div>

          {/* Right Action: Submit Query */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || loading || isUploading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                text.trim() && !loading && !isUploading
                  ? "bg-[#0F172A] text-white hover:bg-slate-800 shadow-xs"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              title="Send question (Enter)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload Progress Overlay / Banner inside input */}
        {isUploading && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-sans">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-3.5 h-3.5 border-2 border-[#E11D48] border-t-transparent animate-spin rounded-full shrink-0" />
              <span className="truncate">{uploadStatus}</span>
            </div>
            {uploadProgress && (
              <span className="font-mono text-[11px] text-slate-400 shrink-0">
                {uploadProgress.percentage}%
              </span>
            )}
          </div>
        )}

        {/* Upload Success indicator */}
        {uploadStatus?.startsWith("✓") && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs font-sans rounded-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
