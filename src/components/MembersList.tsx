"use client";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Separator } from "./ui/separator";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { MemberAvatar } from "./member-avatar";
import { Fragment } from "react";
function MembersList() {
  const { workspaceId } = useWorkspaceId();
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
          <Link href={`/workspaces/?workspace=${workspaceId}`}>
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
            </div>
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

export default MembersList;
