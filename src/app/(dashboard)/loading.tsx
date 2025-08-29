import { Loader } from "lucide-react";

function DashboardLoading() {
  return (
    <div>
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="text-muted-foreground size-6 animate-spin" />
      </div>
    </div>
  );
}

export default DashboardLoading;
