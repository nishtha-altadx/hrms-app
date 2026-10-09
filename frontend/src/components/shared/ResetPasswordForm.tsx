"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { KeyRound } from "lucide-react";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/lib/schemas/auth";
import { backendClient } from "@/lib/backendClient";
import { PasswordField } from "@/components/ui/PasswordField";

type EligibilityReason = "not_found" | "expired" | "used";

const ELIGIBILITY_MESSAGES: Record<EligibilityReason, string> = {
  not_found: "This reset link is invalid.",
  expired: "This reset link has expired. Please request a new one.",
  used: "This reset link has already been used.",
};

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "invalid" | "ready" | "done">("checking");
  const [invalidReason, setInvalidReason] = useState<EligibilityReason | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    let cancelled = false;

    backendClient
      .get<{ valid: true } | { valid: false; reason: EligibilityReason }>(
        `/auth/reset-password/${token}`,
      )
      .then((res) => {
        if (cancelled) return;
        if (res.data.valid) {
          setStatus("ready");
        } else {
          setInvalidReason(res.data.reason);
          setStatus("invalid");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInvalidReason("not_found");
          setStatus("invalid");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await backendClient.post(`/auth/reset-password/${token}`, data);
      setStatus("done");
    } catch (error) {
      const fallback = "Something went wrong. Please try again.";
      setServerError(
        isAxiosError(error) ? (error.response?.data as { message?: string })?.message ?? fallback : fallback,
      );
    }
  };

  if (status === "checking") {
    return <p className="text-center text-sm text-slate-500">Checking your reset link...</p>;
  }

  if (status === "invalid") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {invalidReason ? ELIGIBILITY_MESSAGES[invalidReason] : "This reset link is invalid."}
        </p>
        <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          Your password has been reset.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-violet-500"
        >
          Go to log in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <PasswordField
        label="New password"
        placeholder="Enter a new password"
        error={errors.password?.message}
        {...register("password")}
      />

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" />
        {isSubmitting ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
