"use client";

import { useStoreUserEffect } from "@/lib/useStoreUserEffect";
import { SignUp, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import type { ReactNode } from "react";

function AuthenticationProtected({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useStoreUserEffect();
  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
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
