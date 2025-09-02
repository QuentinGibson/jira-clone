import type { Doc } from "convex/_generated/dataModel";
import type { TaskState, TaskWithDetails } from "types";
import { TaskStatus } from "types";
import { create } from "zustand";

interface KanbanState {
  tasks: TaskState;
  setTasks: (data: TaskWithDetails[]) => void;
  moveTask: (
    taskId: string,
    fromColumn: TaskStatus,
    toColumn: TaskStatus,
    newIndex: number,
  ) => void;
  updateTaskInColumn: (taskId: string, updatedTask: TaskWithDetails) => void;
}

const createInitialTaskState = (): TaskState => ({
  [TaskStatus.Backlog]: [],
  [TaskStatus.Todo]: [],
  [TaskStatus.In_Progress]: [],
  [TaskStatus.In_Review]: [],
  [TaskStatus.Done]: [],
});

export const useKanbanStore = create<KanbanState>()((set, get) => ({
  tasks: createInitialTaskState(),

  setTasks: (data: TaskWithDetails[]) => {
    const initialTasks: TaskState = createInitialTaskState();

    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });

    // Sort each column by position
    Object.keys(initialTasks).forEach((key) => {
      initialTasks[key as TaskStatus].sort((a, b) => a.position - b.position);
    });

    set({ tasks: initialTasks });
  },

  moveTask: (taskId, fromColumn, toColumn, newIndex) => {
    set((state) => {
      const newTasks = { ...state.tasks };

      // Find and remove task from source column
      const taskIndex = newTasks[fromColumn].findIndex(
        (task) => task._id === taskId,
      );
      if (taskIndex === -1) return state; // Task not found

      const removedTasks = newTasks[fromColumn].splice(taskIndex, 1);
      const movedTask = removedTasks[0];
      
      if (!movedTask) return state; // Safety check

      // Update task status if moving to different column
      const updatedTask: TaskWithDetails =
        toColumn !== fromColumn
          ? { ...movedTask, status: toColumn }
          : movedTask;

      // Insert task at new position
      newTasks[toColumn].splice(newIndex, 0, updatedTask);

      return { tasks: newTasks };
    });
  },

  updateTaskInColumn: (taskId, updatedTask) => {
    set((state) => {
      const newTasks = { ...state.tasks };

      // Find task in current column and update it
      Object.keys(newTasks).forEach((status) => {
        const columnStatus = status as TaskStatus;
        const taskIndex = newTasks[columnStatus].findIndex(
          (task) => task._id === taskId,
        );
        if (taskIndex !== -1) {
          newTasks[columnStatus][taskIndex] = updatedTask;
        }
      });

      return { tasks: newTasks };
    });
  },
}));
