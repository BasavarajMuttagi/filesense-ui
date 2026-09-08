import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { CLERK_PUBLISHABLE_KEY } from "./api/config";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6 text-[#161613] font-sans">
        <div className="max-w-md w-full bg-white border border-[#16161314] rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="size-12 rounded-2xl bg-[#FFE4DC] text-[#DD5930] flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h2 className="font-serif text-xl font-bold text-[#161613]">Missing Clerk Configuration</h2>
          <p className="text-xs text-[#16161380] leading-relaxed">
            Please define <code className="font-mono bg-[#1616130a] px-1.5 py-0.5 rounded text-[#161613] font-semibold">VITE_CLERK_PUBLISHABLE_KEY</code> in your <code className="font-mono bg-[#1616130a] px-1.5 py-0.5 rounded text-[#161613] font-semibold">.env</code> file or hosting provider dashboard to activate authentication.
          </p>
        </div>
      </div>
    )}
  </StrictMode>,
);
