"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

interface WorkspaceInviteProps {
  workspaceId: Id<"workspaces">;
}

export default function WorkspaceInvite({ workspaceId }: WorkspaceInviteProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: inviteCode } = useSuspenseQuery(
    convexQuery(api.workspaces.getWorkspaceInviteCode, { workspaceId })
  );

  const { mutateAsync: generateInviteCode } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.generateWorkspaceInviteCode),
    onSuccess: () => {
      toast.success("Invite code generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate invite code");
    },
  });

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      await generateInviteCode({ workspaceId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteCode) return;
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard!");
  };

  const inviteLink = inviteCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}` : '';

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Invite Members</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-7">
        <div className="flex flex-col gap-y-4">
          <p className="text-muted-foreground text-sm">
            Share this invite link with your team members to join this workspace.
          </p>
          
          {inviteCode ? (
            <div className="space-y-2">
              <div className="flex gap-x-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopyInviteLink}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <Button
                onClick={handleGenerateCode}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                className="w-fit"
              >
                <RefreshCcw className="size-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate New Code"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-fit"
            >
              {isGenerating ? "Generating..." : "Generate Invite Code"}
            </Button>
          )}

          <div className="text-muted-foreground text-xs">
            <p>• Anyone with this link can join the workspace</p>
            <p>• Generate a new code to invalidate the previous one</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}