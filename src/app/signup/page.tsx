import Link from "next/link";
import { SignupForm } from "@/components/signup-form";
import { BrandMark } from "@/components/brand-mark";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen w-screen items-center justify-center bg-navy p-6">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-10">
        <div className="flex items-center gap-3">
          <BrandMark size={36} />
          <span className="text-lg font-semibold">CapitalClass</span>
        </div>
        <h1 className="mt-8 text-2xl font-semibold text-navy">Join a class</h1>
        <p className="mt-1 text-sm text-muted">
          Students enter the join code from the board. Teachers are added by a school administrator.
        </p>
        <div className="mt-8">
          <SignupForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link className="font-semibold text-[#2db57a]" href="/login">
            Launch dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
