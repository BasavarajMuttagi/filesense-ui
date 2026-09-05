import React, { useState } from "react";
import { SwissModal } from "../common/SwissModal";
import { SwissInput } from "../common/SwissInput";
import { SwissButton } from "../common/SwissButton";
import {
  DEFAULT_API_BASE_URL,
  getApiBaseUrl,
  setApiBaseUrl,
  getDevToken,
  setDevToken,
  CLERK_PUBLISHABLE_KEY,
} from "../../api/config";
import { Key, Globe, Check } from "lucide-react";

interface DevSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
}

export const DevSettingsModal: React.FC<DevSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}) => {
  const [baseUrl, setBaseUrlState] = useState<string>(getApiBaseUrl());
  const [devToken, setDevTokenState] = useState<string>(getDevToken() || "");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = () => {
    setApiBaseUrl(baseUrl);
    setDevToken(devToken);
    setSavedMessage("Configuration saved successfully");
    onSettingsChanged();
    setTimeout(() => {
      setSavedMessage(null);
      onClose();
    }, 800);
  };

  const handleSetLocalhost = () => {
    setBaseUrlState("http://localhost:8787");
  };

  const handleSetCloudflare = () => {
    setBaseUrlState(DEFAULT_API_BASE_URL);
  };

  const handleClearToken = () => {
    setDevTokenState("");
  };

  return (
    <SwissModal
      isOpen={isOpen}
      onClose={onClose}
      title="System Telemetry & Controls"
      code="ENV // CFG"
      maxWidth="lg"
      footer={
        <>
          {savedMessage && (
            <span className="text-[11px] font-mono text-emerald-600 mr-auto flex items-center gap-1 font-bold">
              <Check className="w-3.5 h-3.5" /> {savedMessage}
            </span>
          )}
          <SwissButton variant="outline" size="sm" onClick={onClose}>
            Cancel
          </SwissButton>
          <SwissButton variant="primary" size="sm" onClick={handleSave}>
            Apply Settings
          </SwissButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* API Base URL Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#E11D48]" /> Worker API Endpoint
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSetCloudflare}
                className="text-[10px] font-mono text-slate-600 hover:text-black border border-slate-200 px-1.5 py-0.5 bg-slate-50 cursor-pointer"
              >
                Production Edge
              </button>
              <button
                type="button"
                onClick={handleSetLocalhost}
                className="text-[10px] font-mono text-slate-600 hover:text-black border border-slate-200 px-1.5 py-0.5 bg-slate-50 cursor-pointer"
              >
                Local:8787
              </button>
            </div>
          </div>
          <SwissInput
            value={baseUrl}
            onChange={(e) => setBaseUrlState(e.target.value)}
            placeholder="https://file-sense-worker.basavaraj2770.workers.dev"
            helperText="Requests to /projects, /documents, /upload, /queries route to this Worker URL."
          />
        </div>

        {/* Dev JWT Token Override */}
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-800 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#E11D48]" /> Dev JWT Override (Optional)
            </span>
            {devToken && (
              <button
                type="button"
                onClick={handleClearToken}
                className="text-[10px] font-mono text-red-600 hover:text-red-800 cursor-pointer"
              >
                Clear Token
              </button>
            )}
          </div>
          <SwissInput
            value={devToken}
            onChange={(e) => setDevTokenState(e.target.value)}
            placeholder="eyJhbGciOiJSUzI1NiIs..."
            helperText="When populated, overrides Clerk session token and sends Authorization: Bearer <token> directly."
          />
        </div>

        {/* Read-Only Configuration Info */}
        <div className="bg-slate-50 border border-slate-200 p-3 flex flex-col gap-1.5 text-[11px] font-mono">
          <div className="text-[10px] uppercase text-slate-600 font-bold tracking-wider">
            Active Clerk Configuration
          </div>
          <div className="truncate text-slate-700">
            <span className="text-slate-600">PUBLISHABLE_KEY:</span> {CLERK_PUBLISHABLE_KEY}
          </div>
        </div>
      </div>
    </SwissModal>
  );
};
