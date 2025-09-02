import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { faker } from "@faker-js/faker";
import WorkplaceSwitcher from "@/components/workplace-switcher";

// Create mock workspaces using Faker.js
const createMockWorkspace = () => ({
  _id: faker.string.uuid(),
  name: faker.company.name(),
  thumbnail: faker.image.avatar(),
  _creationTime: faker.date.recent().getTime(),
});

const mockWorkspaces = Array.from({ length: 5 }, createMockWorkspace);

// Mock Convex hooks
vi.mock("@convex-dev/react-query", () => ({
  useConvexMutation: vi.fn(),
  convexQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useSuspenseQuery: vi.fn(() => ({
    data: mockWorkspaces,
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

test("WorkplaceSwitcher renders workspaces", () => {
  render(<WorkplaceSwitcher />);

  // Check that "Workspaces" header is rendered
  expect(screen.getByText("Workspaces"));

  // Check that placeholder text is shown
  expect(screen.getByText("No workspace selected"));
});

test("WorkplaceSwitcher shows mock workspaces when clicked", async () => {
  const user = userEvent.setup();
  render(<WorkplaceSwitcher />);

  // Click the first select trigger to open dropdown
  const selectTriggers = screen.getAllByRole("combobox");
  await user.click(selectTriggers[0]!);

  // Check that all mock workspace names appear in the dropdown
  mockWorkspaces.forEach((workspace) => {
    expect(screen.getByText(workspace.name));
  });
});
