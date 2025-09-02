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
