import CreateWorkSpaceForm from "@/components/workspaces/create-workspace-form";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-muted-foreground bg-primary px-6 py-4">
      <CreateWorkSpaceForm />
    </div>
  );
}
