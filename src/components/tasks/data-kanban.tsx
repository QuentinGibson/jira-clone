"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import type { Doc } from "convex/_generated/dataModel";
import { DragDropContext } from "@hello-pangea/dnd";
import { TaskStatus } from "types";
import KanbanColumnHeader from "./kanban-column-header";

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusIcon,
} from "lucide-react";

interface DataKanbanProps {
  data: Doc<"tasks">[];
}

type TaskState = {
  [key in TaskStatus]: Doc<"tasks">[];
};

export const DataKanban = ({ data }: DataKanbanProps) => {
  const [tasks, setTasks] = useState<TaskState>(() => {
    const initialTasks: TaskState = {
      [TaskStatus.Backlog]: [],
      [TaskStatus.Todo]: [],
      [TaskStatus.In_Progress]: [],
      [TaskStatus.In_Review]: [],
      [TaskStatus.Done]: [],
    };

    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });

    Object.keys(initialTasks).forEach((key) => {
      initialTasks[key as TaskStatus].sort((a, b) => a.position - b.position);
    });

    return initialTasks;
  });
  const boards: TaskStatus[] = [
    TaskStatus.Backlog,
    TaskStatus.Todo,
    TaskStatus.In_Progress,
    TaskStatus.In_Review,
    TaskStatus.Done,
  ];

  return (
    <DragDropContext onDragEnd={() => {}}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div key={board} className="bg-muted mx-2 flex-1 rounded-md p-1.5">
              <KanbanColumnHeader
                board={board}
                taskcount={tasks[board].length}
              />
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
