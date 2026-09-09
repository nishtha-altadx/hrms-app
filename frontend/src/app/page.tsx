import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">HRMS</h1>
      <div className="flex gap-4">
        <Link href="/login" className="rounded bg-black px-4 py-2 text-white">
          Log in
        </Link>
        <Link href="/signup" className="rounded border px-4 py-2">
          Sign up
        </Link>
      </div>
    </main>
  );
}
