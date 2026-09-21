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
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-lg shadow-indigo-900/10">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-slate-500">Checking your session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
