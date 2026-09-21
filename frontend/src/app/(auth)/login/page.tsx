import { Sparkles, ShieldCheck, Users } from "lucide-react";
import { LoginForm } from "@/components/shared/LoginForm";
import { BrandMark } from "@/components/shared/BrandMark";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-indigo-900/10 lg:grid-cols-2">
        {/* Decorative panel — hidden on small screens */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-10 text-white lg:flex">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

          <BrandMark light />

          <div className="relative flex flex-col gap-4">
            <h1 className="text-3xl font-bold leading-tight">
              Welcome back <span aria-hidden>👋</span>
            </h1>
            <p className="max-w-xs text-sm text-indigo-100">
              Log in to continue to your dashboard and pick up right where you left off.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5 shrink-0 text-white" />
                <span className="text-sm text-indigo-50">Secure, token-based authentication</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <Users className="h-5 w-5 shrink-0 text-white" />
                <span className="text-sm text-indigo-50">Built for teams of every size</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-indigo-200">
            <Sparkles className="h-4 w-4" />
            Human Resource Management, simplified.
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center gap-6 p-8 sm:p-10">
          <div className="flex flex-col gap-1 lg:hidden">
            <BrandMark />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Log in</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
