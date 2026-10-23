import { vi } from "vitest";

// Next enforces this boundary at build time; Vitest runs outside React's server resolver.
vi.mock("server-only", () => ({}));
