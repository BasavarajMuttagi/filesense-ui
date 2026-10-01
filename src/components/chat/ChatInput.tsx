import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { UploadProgress } from "@tigrisdata/storage/client";
import { uploadFile, MAX_FILE_SIZE_BYTES } from "../../api/upload";
import type { Project } from "../../types";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  ArrowUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Square,
  FileText,
  X,
} from "lucide-react";

interface ChatInputProps {
  activeProject: Project | null;
  onSendMessage: (question: string) => void;
  onDocumentUploaded?: () => void;
  onOpenNewProjectModal: () => void;
  loading: boolean;
  onStop?: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  activeProject,
  onSendMessage,
  onDocumentUploaded,
  onOpenNewProjectModal,
  loading,
  onStop,
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
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

  const handleFilesUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    if (!activeProject) {
      onOpenNewProjectModal();
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadSuccessName(null);

    const total = files.length;
    let successCount = 0;
    const failedFiles: string[] = [];

    for (let i = 0; i < total; i++) {
      const file = files[i];
      const fileIndex = i + 1;

      if (file.size > MAX_FILE_SIZE_BYTES) {
        failedFiles.push(`${file.name} (exceeds 25MB limit)`);
        continue;
      }

      if (total > 1) {
        setUploadFileName(`${file.name} (${fileIndex}/${total})`);
      } else {
        setUploadFileName(file.name);
      }

      setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        const token = await getToken();
        await uploadFile(
          {
            projectId: activeProject.id,
            file,
            token,
          },
          (p) => setUploadProgress(p)
        );

        successCount++;
        onDocumentUploaded?.();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        failedFiles.push(`${file.name} (${message})`);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
    setUploadFileName(null);

    if (successCount > 0) {
      setUploadSuccessName(
        total > 1
          ? `Uploaded ${successCount} files — indexing in background...`
          : "File uploaded — indexing in background..."
      );
      setTimeout(() => setUploadSuccessName(null), 4000);
    }

    if (failedFiles.length > 0) {
      setErrorMessage(failedFiles.join(", "));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="relative w-full max-w-3xl mx-auto px-4 pb-4 font-sans"
    >
      {/* Upload Progress Bar */}
      {isUploading && uploadProgress && (
        <div className="mb-2 p-2.5 bg-muted/60 border rounded-lg flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin" />
              Uploading {uploadFileName || "document"}...
            </span>
            <span className="font-mono text-muted-foreground">{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccessName && (
        <div className="mb-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
            <span>{uploadSuccessName}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccessName(null)}
            className="text-emerald-700/60 hover:text-emerald-700 cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="mb-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="size-3.5 shrink-0 text-destructive" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-destructive/60 hover:text-destructive cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-x-4 inset-y-0 bg-accent/80 border-2 border-dashed border-primary rounded-xl flex items-center justify-center z-30 pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-background px-3 py-1.5 rounded-md border shadow-sm">
            <FileText className="size-3.5" />
            <span>Drop documents here</span>
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative flex flex-col bg-background border border-input rounded-xl focus-within:ring-1 focus-within:ring-ring transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !activeProject
              ? "Select or create a project to start chatting..."
              : placeholder
          }
          rows={1}
          disabled={isUploading}
          className="w-full bg-transparent px-3.5 pt-3 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[40px] max-h-[160px] leading-relaxed"
        />

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between px-2.5 pb-2.5 pt-0.5">
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.docx,.csv,.json,.ts,.tsx,.py"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilesUpload(Array.from(e.target.files));
                }
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              title="Attach documents"
              className="text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            {loading ? (
              <Button
                type="button"
                variant="destructive"
                size="icon-xs"
                onClick={onStop}
                title="Stop generation"
              >
                <Square className="size-3 fill-current" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon-xs"
                disabled={!text.trim() || isUploading}
                onClick={handleSend}
                title="Send message"
              >
                <ArrowUp className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
