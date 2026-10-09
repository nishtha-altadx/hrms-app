"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Mail, Send } from "lucide-react";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/lib/schemas/auth";
import { backendClient } from "@/lib/backendClient";
import { TextField } from "@/components/ui/TextField";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setMessage(null);
    try {
      const res = await backendClient.post<{ message: string }>("/auth/forgot-password", data);
      setMessage(res.data.message);
    } catch (error) {
      // The backend already returns a generic message on success; a network/validation
      // failure here is the only case that reaches this branch.
      const fallback = "Something went wrong. Please try again.";
      setMessage(isAxiosError(error) ? (error.response?.data as { message?: string })?.message ?? fallback : fallback);
    }
  };

  if (message) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{message}</p>
        <Link href="/login" className="text-sm font-medium text-indigo-600 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <TextField
        label="Email"
        icon={Mail}
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
