"use client";
import DashboardContainer from "@/components/DashboardContainer";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { setWorkspaceId } = useWorkspaceId();
  const { data: workspaces } = useSuspenseQuery(
    convexQuery(api.workspaces.list, {}),
  );

  useEffect(() => {
    if (workspaces.length === 0) {
      router.push(`/workspaces/create`);
    } else {
      router.push(`/workspaces/?workspace=${workspaces[0]?._id}`);
    }
  }, [workspaces, router]);

  return <DashboardContainer>Home Page</DashboardContainer>;
}
