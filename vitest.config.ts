import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "path";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    optimizeDeps: {
      include: [
        "vitest-browser-react",
        "@base-ui/react/menu",
        "@base-ui/react/collapsible",
        "@base-ui/react/preview-card",
        "@base-ui/react",
        "axios",
        "lucide-react",
        "@streamdown/cjk",
        "@streamdown/code",
        "@streamdown/math",
        "@streamdown/mermaid",
        "mermaid",
        "react-markdown",
        "remark-gfm",
        "streamdown",
        "use-stick-to-bottom",
      ],
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            include: ["src/**/*.{test,spec}.{ts,tsx}"],
            setupFiles: ["./src/test/setup.unit.tsx"],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              screenshotFailures: false,
              instances: [
                {
                  browser: "chromium",
                  viewport: { width: 1280, height: 720 },
                },
              ],
            },
          },
        },
        {
          extends: true,
          test: {
            name: "visual",
            include: ["src/**/*.{test,spec}.{ts,tsx}"],
            setupFiles: ["./src/test/setup.visual.tsx"],
            globalSetup: ["./vitest.setup-flush.mjs"],
            update: true,
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              screenshotFailures: false,
              instances: [
                {
                  browser: "chromium",
                  viewport: { width: 1280, height: 720 },
                },
              ],
              screenshotDirectory: path.resolve(import.meta.dirname, "screenshots"),
              expect: {
                toMatchScreenshot: {
                  resolveScreenshotPath: ({ root, arg, ext, browserName, platform, testFileName }: any) => {
                    return path.resolve(root, "screenshots", testFileName, `${arg}-${browserName}-${platform}${ext}`);
                  },
                },
              },
            },
          },
        },
      ],
    },
  })
);
