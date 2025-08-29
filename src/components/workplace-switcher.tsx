"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { RiAddCircleFill } from "react-icons/ri";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { WorkspaceAvatar } from "./workspace-avatar";
import { useRouter } from "next/navigation";

function WorkplaceSwitcher() {
  const router = useRouter();
  const { data: workspaces } = useSuspenseQuery(
    convexQuery(api.workspaces.list, {}),
  );
  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-neutral-500 uppercase">Workspaces</p>
        <RiAddCircleFill className="size-5 cursor-pointer text-neutral-500"></RiAddCircleFill>
      </div>
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-full border-0 ring-0 ring-transparent outline-none focus:ring-0 focus:ring-transparent focus-visible:border-0">
          <SelectValue
            className="border-0"
            placeholder="No workspace selected"
          />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => {
            return (
              <SelectItem key={workspace.name} value={workspace.name}>
                <div className="flex items-center justify-start gap-3 font-medium">
                  <WorkspaceAvatar
                    name={workspace.name}
                    image={workspace.thumbnail}
                  />
                  <span className="truncate">{workspace.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export default WorkplaceSwitcher;
