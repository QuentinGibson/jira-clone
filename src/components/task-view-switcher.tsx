"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Loader, PlusIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { useCreateTaskModal } from "@/hooks/use-create-task-modal";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import DataFilters from "./data-filters";
import { useTaskFilters } from "@/hooks/use-task-filters";
import type { Id } from "convex/_generated/dataModel";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./tasks/data-kanban";
import DataCalendar from "./data-calender";

function TaskViewSwitcher() {
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });
  const { open } = useCreateTaskModal();
  const { projectId } = useProjectId();
  const { workspaceId } = useWorkspaceId();
  const [{ status, assigneeId, dueDate }] = useTaskFilters();
  const { data: tasks } = useSuspenseQuery(
    convexQuery(api.tasks.list, {
      projectId,
      workspaceId,
      status: status || undefined,
      assigneeId: (assigneeId as Id<"users">) || undefined,
      dueDate: dueDate || undefined,
    }),
  );

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="w-full flex-1 rounded-lg border"
    >
      <div className="flex h-full flex-col overflow-auto p-4">
        <div className="flex flex-col items-center justify-between gap-y-2 lg:flex-row">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
              Table
            </TabsTrigger>

            <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
              Kanban
            </TabsTrigger>

            <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button size="sm" className="w-full lg:w-auto" onClick={open}>
            <PlusIcon className="mr-2 size-4" />
            New
          </Button>
        </div>
        <Separator className="my-4" />
        <DataFilters />
        <Separator className="my-4" />
        <Suspense fallback={<IsLoading />}>
          <TabsContent value="table" className="mt-0">
            <DataTable data={tasks} columns={columns} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            <DataKanban data={tasks} />
          </TabsContent>
          <TabsContent value="calendar" className="mt-0 h-full pb-4">
            <DataCalendar data={tasks} />
          </TabsContent>
        </Suspense>
      </div>
    </Tabs>
  );
}

const IsLoading = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <Loader className="animate-spin" />
    </div>
  );
};

export default TaskViewSwitcher;
