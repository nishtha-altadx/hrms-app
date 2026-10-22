"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Mail, Pencil, Phone, ShieldCheck, UserRound, VenetianMask } from "lucide-react";
import { genderOptions, profileSchema, ProfileFormValues } from "@/lib/schemas/auth";
import { AuthUser, ProfileUpdate, updateProfile } from "@/features/auth/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";

function toFormValues(user: AuthUser): ProfileFormValues {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    gender: user.gender ?? "",
  };
}

const CLEARABLE = ["phone", "dateOfBirth", "gender"] as const;

function ReadOnlyRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex items-center gap-2.5 text-sm text-slate-500">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export function EditProfileForm({ user }: { user: AuthUser }) {
  const { updateProfile: dispatchUpdateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(user),
  });

  const startEditing = () => {
    reset(toFormValues(user));
    setServerError(null);
    setSaved(false);
    setIsEditing(true);
  };

  const cancel = () => {
    reset(toFormValues(user));
    setServerError(null);
    setIsEditing(false);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setServerError(null);

    // Send only changed fields; empty clearable fields go as null so the backend clears them.
    const payload: Record<string, string | null> = {};
    for (const key of Object.keys(dirtyFields) as (keyof ProfileFormValues)[]) {
      const value = data[key];
      payload[key] = value === "" && (CLEARABLE as readonly string[]).includes(key) ? null : value;
    }

    const result = await dispatchUpdateProfile(payload as ProfileUpdate);
    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
      setSaved(true);
    } else {
      setServerError((result.payload as string) ?? "Failed to update profile");
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200/50 lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">Profile details</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {saved && !isEditing && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Profile updated.
        </p>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="First name"
              icon={UserRound}
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <TextField
              label="Last name"
              icon={UserRound}
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <TextField
            label="Email"
            icon={Mail}
            type="email"
            value={user.email}
            disabled
            readOnly
            className="cursor-not-allowed opacity-70"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Phone"
              icon={Phone}
              type="tel"
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <TextField
              label="Date of birth"
              icon={Calendar}
              type="date"
              error={errors.dateOfBirth?.message}
              {...register("dateOfBirth")}
            />
          </div>

          <SelectField
            label="Gender"
            icon={VenetianMask}
            error={errors.gender?.message}
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

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={cancel}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-4 flex flex-col divide-y divide-slate-100">
          <ReadOnlyRow icon={UserRound} label="Name">
            {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
          </ReadOnlyRow>
          <ReadOnlyRow icon={Mail} label="Email">
            {user.email}
          </ReadOnlyRow>
          <ReadOnlyRow icon={Phone} label="Phone">
            {user.phone || "—"}
          </ReadOnlyRow>
          <ReadOnlyRow icon={Calendar} label="Date of birth">
            {user.dateOfBirth || "—"}
          </ReadOnlyRow>
          <ReadOnlyRow icon={VenetianMask} label="Gender">
            <span className="capitalize">{user.gender || "—"}</span>
          </ReadOnlyRow>
          <ReadOnlyRow icon={ShieldCheck} label="Role">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-700">
              {user.role}
            </span>
          </ReadOnlyRow>
        </dl>
      )}
    </section>
  );
}
