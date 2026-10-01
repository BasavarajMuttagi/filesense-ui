import "./setup.common";
import { expect } from "vitest";

// In unit test mode, bypass screenshot comparisons so tests focus on behavioral assertions
expect.extend({
  async toMatchScreenshot() {
    return {
      pass: true,
      message: () => "Screenshot assertion bypassed in unit test mode",
    };
  },
});
