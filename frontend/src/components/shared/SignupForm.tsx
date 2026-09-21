"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Mail, Phone, UserPlus, UserRound, VenetianMask } from "lucide-react";
import { genderOptions, signupSchema, SignupFormValues } from "@/lib/schemas/auth";
import { signup } from "@/features/auth/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { SelectField } from "@/components/ui/SelectField";

export function SignupForm() {
  const { signup: dispatchSignup } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);
    // Native inputs give "" for untouched optional fields; the backend
    // expects those to be absent entirely, not empty strings.
    const payload = {
      ...data,
      phone: data.phone || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      gender: data.gender || undefined,
    };
    const result = await dispatchSignup(payload);
    if (signup.fulfilled.match(result)) {
      router.push("/dashboard");
    } else {
      setServerError((result.payload as string) ?? "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="First name"
          icon={UserRound}
          placeholder="Jane"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <TextField
          label="Last name"
          icon={UserRound}
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <TextField
        label="Email"
        icon={Mail}
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <PasswordField
        label="Password"
        placeholder="Create a password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Phone (optional)"
          icon={Phone}
          type="tel"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <TextField
          label="Date of birth (optional)"
          icon={Calendar}
          type="date"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />
      </div>

      <SelectField
        label="Gender (optional)"
        icon={VenetianMask}
        error={errors.gender?.message}
        defaultValue=""
        {...register("gender")}
      >
        <option value="">Prefer not to say</option>
        {genderOptions.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </SelectField>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
