"use client";

import { useRouter } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  VenetianMask,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BrandMark } from "@/components/shared/BrandMark";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHome() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email;
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50 md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-sm md:hidden">
        <BrandMark />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white/80 p-6 backdrop-blur-sm md:flex">
        <div className="flex flex-col gap-8">
          <BrandMark />
          <nav className="flex flex-col gap-1">
            <span className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </span>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
            <p className="mt-2 text-sm font-semibold">Keep going!</p>
            <p className="mt-1 text-xs text-indigo-100">Small steps make big progress.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{getGreeting()},</p>
              <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30">
              {initials}
            </span>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200/50 lg:col-span-2">
              <h2 className="text-base font-semibold text-slate-900">Profile details</h2>

              <dl className="mt-4 flex flex-col divide-y divide-slate-100">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2.5 text-sm text-slate-500">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Email
                  </dt>
                  <dd className="text-sm font-medium text-slate-900">{user?.email}</dd>
                </div>

                {user?.phone && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-2.5 text-sm text-slate-500">
                      <Phone className="h-4 w-4 text-slate-400" />
                      Phone
                    </dt>
                    <dd className="text-sm font-medium text-slate-900">{user.phone}</dd>
                  </div>
                )}

                {user?.dateOfBirth && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-2.5 text-sm text-slate-500">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Date of birth
                    </dt>
                    <dd className="text-sm font-medium text-slate-900">{user.dateOfBirth}</dd>
                  </div>
                )}

                {user?.gender && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-2.5 text-sm text-slate-500">
                      <VenetianMask className="h-4 w-4 text-slate-400" />
                      Gender
                    </dt>
                    <dd className="text-sm font-medium capitalize text-slate-900">{user.gender}</dd>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2.5 text-sm text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    Role
                  </dt>
                  <dd>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-700">
                      {user?.role}
                    </span>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="flex flex-col justify-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-6 w-6" />
              <p className="text-lg font-semibold">You&apos;re doing great!</p>
              <p className="text-sm text-indigo-100">Keep learning, keep growing, keep building.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
