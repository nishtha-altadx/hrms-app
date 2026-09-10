import { LoginForm } from "@/components/shared/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Log in</h1>
      <LoginForm />
    </main>
  );
}
