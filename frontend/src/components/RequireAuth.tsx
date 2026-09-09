"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMe } from "@/features/auth/authSlice";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMe());
    }
  }, [status, dispatch]);

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
