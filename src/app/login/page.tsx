import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <Card>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black text-navy">Sign in to Capital Class</h1>
        <p className="mt-3 text-sm font-medium text-navy/70">
          Demo teacher: <b>teacher@capitalclass.local</b> / <b>teacher</b>
          <br />
          Demo student: <b>mia@capitalclass.local</b> / <b>student</b>
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm font-medium text-navy/70">
          New here?{" "}
          <Link className="font-bold text-sky" href="/signup">
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  );
}
