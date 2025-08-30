"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users } from "lucide-react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, use } from "react";

interface JoinWorkspacePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

export default function JoinWorkspacePage({ params }: JoinWorkspacePageProps) {
  const { inviteCode } = use(params);
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const { data: workspace } = useSuspenseQuery(
    convexQuery(api.workspaces.getWorkspaceByInviteCode, { inviteCode })
  );

  const { mutateAsync: joinWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.joinWorkspaceByInviteCode),
    onSuccess: (workspaceId) => {
      toast.success("Successfully joined workspace!");
      router.push(`/workspaces/?workspace=${workspaceId}`);
    },
    onError: (error) => {
      if (error.message.includes("Invalid invite code")) {
        toast.error("Invalid or expired invite code");
      } else {
        toast.error("Failed to join workspace");
      }
    },
  });

  const handleJoinWorkspace = async () => {
    setIsJoining(true);
    try {
      await joinWorkspace({ inviteCode });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Avatar className="size-16">
              <AvatarImage src={workspace.thumbnail || undefined} />
              <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
                {workspace.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">Join {workspace.name}</CardTitle>
          <CardDescription>
            You've been invited to join this workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>Workspace: {workspace.name}</span>
          </div>
          
          <Button 
            onClick={handleJoinWorkspace}
            disabled={isJoining}
            className="w-full"
            size="lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Workspace"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By joining, you'll have access to all workspace content and can collaborate with team members.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}