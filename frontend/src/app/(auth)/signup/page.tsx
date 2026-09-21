import { SignupForm } from "@/components/shared/SignupForm";
import { BrandMark } from "@/components/shared/BrandMark";

export default function SignupPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 p-4 py-10 sm:p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-900/10 sm:p-10">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <BrandMark />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Join us and start your journey</p>
          </div>
        </div>

        <SignupForm />
      </div>
    </main>
  );
}
