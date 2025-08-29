import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../src/app/(dashboard)/page";

// Mock Convex hooks
vi.mock("@convex-dev/react-query", () => ({
  useConvexMutation: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

test("Page", () => {
  render(<Page />);
  expect(screen.getByText("Create a new workspace"));
});
