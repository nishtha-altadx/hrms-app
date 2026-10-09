import { ForgotPasswordForm } from "@/components/shared/ForgotPasswordForm";
import { BrandMark } from "@/components/shared/BrandMark";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-900/10 sm:p-10">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <BrandMark />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Forgot your password?</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>
        </div>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}
