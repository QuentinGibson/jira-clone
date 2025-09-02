"use client";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Separator } from "./ui/separator";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { MemberAvatar } from "./member-avatar";
import { Fragment } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Route } from "next";

enum WorkspaceRole {
  Admin = "ADMIN",
  Member = "MEMBER",
}

function MembersList() {
  const { workspaceId } = useWorkspaceId();
  const { mutateAsync: deleteMemberAsync } = useMutation({
    mutationFn: useConvexMutation(api.members.remove),
  });
  const { mutateAsync: changeRoleAsync } = useMutation({
    mutationFn: useConvexMutation(api.members.changeRole),
  });
  if (!workspaceId) throw Error("No workspace Id");
  const { data: members } = useSuspenseQuery(
    convexQuery(api.members.listWorkspaceMembers, {
      workspaceId: workspaceId as Id<"workspaces">,
    }),
  );
  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="flex items-center space-y-0 gap-x-4 p-7">
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/workspaces/?workspace=${workspaceId}` as Route}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members list</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        {members.map((member) => (
          <Fragment key={member._id}>
            <div className="flex items-center gap-2">
              <MemberAvatar
                name={member.name}
                className="size-10"
                fallbackClassName="text-lg"
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(member._creationTime).toDateString()}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="ml-auto" variant="secondary" size="icon">
                    <MoreVertical className="text-muted-foreground size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() =>
                      changeRoleAsync({
                        workspaceId: workspaceId as Id<"workspaces">,
                        memberId: member._id,
                        role: WorkspaceRole.Admin,
                      })
                    }
                    disabled={false}
                  >
                    Set as Administrator
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() =>
                      changeRoleAsync({
                        workspaceId: workspaceId as Id<"workspaces">,
                        memberId: member._id,
                        role: WorkspaceRole.Member,
                      })
                    }
                    disabled={false}
                  >
                    Set as Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium text-red-500 hover:text-red-400"
                    onClick={() =>
                      deleteMemberAsync({
                        memberId: member._id,
                        workspaceId: workspaceId as Id<"workspaces">,
                      })
                    }
                    disabled={false}
                  >
                    Remove {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

export default MembersList;
