"use client";

import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";

function DashboardContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace("/login");
  };

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>
        Logged in as <strong>{user?.email}</strong> ({user?.role})
      </p>
      <button
        onClick={handleLogout}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Log out
      </button>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
