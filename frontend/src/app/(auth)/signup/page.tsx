import { SignupForm } from "@/components/shared/SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Create an account</h1>
      <SignupForm />
    </main>
  );
}
