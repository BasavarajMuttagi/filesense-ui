import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Clerk React
vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({
    user: {
      id: "test-user-id",
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("mock-jwt-token"),
    isLoaded: true,
    isSignedIn: true,
    userId: "test-user-id",
  }),
  UserButton: () => <div data-testid="mock-user-button">UserButton</div>,
}));
