import { ResetPasswordForm } from "@/components/shared/ResetPasswordForm";
import { BrandMark } from "@/components/shared/BrandMark";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-900/10 sm:p-10">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <BrandMark />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
            <p className="mt-1 text-sm text-slate-500">Choose a new password for your account</p>
          </div>
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
