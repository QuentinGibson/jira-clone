"use client";

import { useStoreUserEffect } from "@/lib/useStoreUserEffect";
import { SignUp } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Loader } from "lucide-react";
import type { ReactNode } from "react";

function AuthenticationProtected({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useStoreUserEffect();
  return (
    <>
      {isLoading ? (
        <div className="flex min-h-dvh items-center justify-center">
          <Loader className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : !isAuthenticated ? (
        <div className="flex min-h-dvh items-center justify-center">
          <Unauthenticated>
            <SignUp />
          </Unauthenticated>
        </div>
      ) : (
        <Authenticated>{children}</Authenticated>
      )}
    </>
  );
}

export default AuthenticationProtected;
