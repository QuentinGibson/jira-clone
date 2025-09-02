import { i } from "node_modules/@clerk/clerk-react/dist/useAuth-BVxIa9U7.mjs";
import type { TaskStatus } from "types";
import { create } from "zustand";

interface InitialStatusState {
  initialStatus: TaskStatus | undefined;
  changeStatus: (initialStatus: TaskStatus) => void;
}

export const useInitialStatusStore = create<InitialStatusState>()((set) => ({
  initialStatus: undefined,
  changeStatus: (initialStatus) => set((state) => ({ initialStatus })),
}));
