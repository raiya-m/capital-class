import Link from "next/link";
import { SignupForm } from "@/components/signup-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <Card>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">Join a classroom</p>
        <h1 className="mt-2 text-3xl font-black text-navy">Create your account</h1>
        <p className="mt-3 text-sm font-medium text-navy/70">
          Teachers get a join code. Students enter the code from the board.
        </p>
        <div className="mt-6">
          <SignupForm />
        </div>
        <p className="mt-6 text-sm font-medium text-navy/70">
          Already have an account?{" "}
          <Link className="font-bold text-sky" href="/login">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
