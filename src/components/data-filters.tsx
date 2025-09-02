import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Folder, ListChecks, UserIcon } from "lucide-react";
import { TaskStatus } from "types";
import DatePicker from "./date-picker";

interface DataFiltersProps {
  hideProjectFilters?: boolean;
}

function DataFilters({ hideProjectFilters }: DataFiltersProps) {
  const { workspaceId } = useWorkspaceId();
  const { projectId, setProjectId } = useProjectId();

  const { data: members } = useSuspenseQuery(
    convexQuery(api.members.listWorkspaceMembers, { workspaceId }),
  );
  const { data: projects } = useSuspenseQuery(
    convexQuery(api.projects.list, { workspaceId }),
  );

  const projectOptions = projects.map((project) => ({
    value: project._id,
    label: project.name,
  }));

  const memberOptions = members.map((member) => ({
    value: member._id,
    label: member.name,
  }));

  const [{ status, assigneeId, dueDate }, setFilters] = useTaskFilters();

  const onStatusChange = (value: string) => {
    if (value === "all") {
      setFilters({ status: null });
    } else {
      setFilters({ status: value as TaskStatus });
    }
  };

  const onAssingeeChange = (value: string) => {
    if (value === "all") {
      setFilters({ assigneeId: null });
    } else {
      setFilters({ assigneeId: value as string });
    }
  };

  const onProjectChange = (value: string) => {
    if (value === "all") {
      setProjectId(projectId);
    } else {
      setProjectId(value);
    }
  };
  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => {
          onStatusChange(value);
        }}
      >
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <ListChecks className="mr-2 size-4" />
            <SelectValue placeholder="All statuses" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectSeparator />
          {Object.entries(TaskStatus).map(([key, value]) => (
            <SelectItem key={key} value={value}>
              {key.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={(value) => {
          onAssingeeChange(value);
        }}
      >
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <UserIcon className="mr-2 size-4" />
            <SelectValue placeholder="All Assingees" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          <SelectSeparator />
          {memberOptions.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={projectId ?? undefined}
        onValueChange={(value) => {
          onProjectChange(value);
        }}
      >
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <Folder className="mr-2 size-4" />
            <SelectValue placeholder="All Assingees" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projets</SelectItem>
          <SelectSeparator />
          {projectOptions.map((project) => (
            <SelectItem key={project.value} value={project.value}>
              {project.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DatePicker
        placeholder="Due date"
        className="h-8 w-full lg:w-auto"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) =>
          setFilters({ dueDate: date ? date.getTime() : null })
        }
      />
    </div>
  );
}

export default DataFilters;
