"use client";

import DashboardContainer from "@/components/DashboardContainer";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { UserButton } from "@clerk/clerk-react";

interface StandaloneLayoutProps {
  children: ReactNode;
}
function StandaloneLayout({ children }: StandaloneLayoutProps) {
  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-2xl p-4">
        <nav className="flex h-[73px] items-center justify-between">
          <Link href="/">
            <Image src="/logo.svg" alt="Logo" height={56} width={152} />
          </Link>
          <UserButton />
        </nav>
        <DashboardContainer>{children}</DashboardContainer>
      </div>
    </main>
  );
}

export default StandaloneLayout;
