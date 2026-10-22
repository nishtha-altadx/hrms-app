import { z } from "zod";

export const genderOptions = ["male", "female", "other"] as const;

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(genderOptions).optional().or(z.literal("")),
});

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "Max 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Max 50 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,15}$/, "Enter a valid phone number")
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .refine((value) => value === "" || new Date(value) <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
  gender: z.enum(genderOptions).or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type LoginFormValues =z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
