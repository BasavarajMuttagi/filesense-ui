import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { checkHealth, type HealthStatus } from "../../api/health";
import { getDevToken } from "../../api/config";
import { SwissButton } from "../common/SwissButton";
import { SwissBadge } from "../common/SwissBadge";
import { Sliders, ShieldCheck, Activity } from "lucide-react";

interface SwissHeaderProps {
  activeProjectTitle?: string | null;
  onOpenSettings: () => void;
  refreshTrigger?: number;
}

export const SwissHeader: React.FC<SwissHeaderProps> = ({
  activeProjectTitle,
  onOpenSettings,
  refreshTrigger,
}) => {
  const { user } = useUser();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const hasDevToken = Boolean(getDevToken());

  useEffect(() => {
    let mounted = true;

    const runHealthCheck = async () => {
      const res = await checkHealth();
      if (mounted) setHealth(res);
    };

    runHealthCheck();

    const interval = setInterval(runHealthCheck, 30000); // 30s poll
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshTrigger]);

  return (
    <header className="w-full bg-white border-b border-slate-900 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand & Context */}
        <div className="flex items-center gap-3.5">
          {/* Swiss Graphic Symbol */}
          <div className="w-7 h-7 bg-[#0F172A] flex items-center justify-center relative shrink-0">
            <div className="w-4 h-1 bg-[#E11D48]" />
            <div className="w-1 h-4 bg-[#E11D48] absolute" />
            <div className="w-1 h-1 bg-white absolute" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base tracking-tighter text-slate-900 font-sans">
              FILESENSE
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-600 uppercase tracking-widest hidden sm:inline">
              // INTELLIGENCE ENGINE
            </span>
          </div>

          {activeProjectTitle && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-[10px] font-mono text-slate-600 uppercase">ACTIVE:</span>
              <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[180px]">
                {activeProjectTitle}
              </span>
            </div>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Health status badge */}
          <div className="hidden sm:flex items-center">
            {health ? (
              <SwissBadge
                variant={health.online ? "processed" : "error"}
                pulse={health.online}
              >
                <Activity className="w-3 h-3 inline mr-1" />
                {health.online ? `LIVE // ${health.latencyMs}ms` : "OFFLINE"}
              </SwissBadge>
            ) : (
              <SwissBadge variant="default">CONNECTING...</SwissBadge>
            )}
          </div>

          {/* Dev Token Active Tag */}
          {hasDevToken && (
            <div title="Dev JWT Override Active">
              <SwissBadge variant="vermilion">
                <ShieldCheck className="w-3 h-3 inline mr-0.5" /> DEV_TOKEN
              </SwissBadge>
            </div>
          )}

          {/* Telemetry/Settings Toggle */}
          <SwissButton
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            icon={<Sliders className="w-3.5 h-3.5" />}
            title="System & API Configuration"
          >
            <span className="hidden sm:inline">CONFIG</span>
          </SwissButton>

          {/* Authentication State */}
          <div className="flex items-center pl-2 border-l border-slate-200">
            <SignedIn>
              <div className="flex items-center gap-2">
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-mono font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                  </div>
                  <div className="text-[9px] font-mono text-slate-600 uppercase">
                    AUTHENTICATED
                  </div>
                </div>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-7 h-7 rounded-none border border-slate-900",
                    },
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <SwissButton variant="vermilion" size="sm">
                  SIGN IN
                </SwissButton>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};
