"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { TaskStatus, type TaskWithDetails } from "types";
import KanbanColumnHeader from "./kanban-column-header";

import KanbanCard from "./kanban-card";
import { useKanbanStore } from "@/hooks/use-kanban-store";
import { useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface DataKanbanProps {
  data: TaskWithDetails[];
}

export const DataKanban = ({ data }: DataKanbanProps) => {
  const { workspaceId } = useWorkspaceId();
  const { setTasks, tasks, moveTask } = useKanbanStore();
  const { mutate: updateTask } = useMutation({
    mutationFn: useConvexMutation(api.tasks.edit),
  });

  const boards: TaskStatus[] = [
    TaskStatus.Backlog,
    TaskStatus.Todo,
    TaskStatus.In_Progress,
    TaskStatus.In_Review,
    TaskStatus.Done,
  ];

  // Initialize tasks when data changes
  useEffect(() => {
    setTasks(data);
  }, [data, setTasks]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination, draggableId } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      // Use the moveTask function from the store
      moveTask(draggableId, sourceStatus, destStatus, destination.index);

      // Calculate new position based on destination index
      const newPosition = (destination.index + 1) * 1000; // Space positions by 1000

      // Update the task in database
      updateTask({
        workspaceId: workspaceId,
        taskId: draggableId as Id<"tasks">,
        status: destStatus,
        position: newPosition,
      });
    },
    [moveTask, updateTask],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div key={board} className="bg-muted mx-2 flex-1 rounded-md p-1.5">
              <KanbanColumnHeader
                board={board}
                taskcount={tasks[board].length}
              />
              <Droppable droppableId={board}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px] space-y-1.5 py-1.5"
                  >
                    {tasks[board].map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
