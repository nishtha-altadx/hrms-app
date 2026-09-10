"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function DashboardHome() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>
        Logged in as <strong>{user?.email}</strong> ({user?.role})
      </p>
      <button onClick={handleLogout} className="rounded bg-black px-4 py-2 text-white">
        Log out
      </button>
    </main>
  );
}
