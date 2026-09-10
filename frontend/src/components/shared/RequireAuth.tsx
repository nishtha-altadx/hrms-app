"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, fetchProfile } = useAuth();

  useEffect(() => {
    if (status === "idle") {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <p className="p-8 text-sm text-zinc-500">Checking your session...</p>;
  }

  return <>{children}</>;
}
