"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}
function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.log(error.message);
  });
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <AlertCircle className="size-6" />
        <h2 className="text-muted-foreground text-lg">Something went wrong!</h2>
        <div className="flex gap-3">
          <Button variant="ghost">
            <Link href="/">Home</Link>
          </Button>
          <Button onClick={reset}>Retry</Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
