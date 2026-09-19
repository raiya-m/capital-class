import { LoginForm } from "@/components/login-form";
import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen w-screen md:grid-cols-2">
      <section className="bg-navy p-10 text-white md:p-16">
        <div className="flex items-center gap-3">
          <BrandMark size={36} />
          <span className="text-lg font-semibold">CapitalClass</span>
        </div>
        <h1 className="mt-16 max-w-sm text-4xl font-semibold leading-tight">
          Good choices earn tokens. News moves the market.
        </h1>
        <p className="mt-5 max-w-sm text-base leading-7 text-white/80">
          Administrators manage who can teach. Teachers award tokens and add students. Students split tokens into savings
          and market dollars, then read the bulletin before they trade. Practice money only.
        </p>
        <p className="mt-16 text-base text-white/50">Practice market · classroom-safe incidents</p>
      </section>
      <section className="flex flex-col justify-center bg-white p-10 md:p-16">
        <h2 className="text-2xl font-semibold text-navy">Welcome to CapitalClass</h2>
        <p className="mt-1 text-sm text-muted">Choose your path to enter the classroom economy.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          Student with a join code?{" "}
          <Link className="font-semibold text-[#2db57a]" href="/signup">
            Join a class
          </Link>
        </p>
      </section>
    </main>
  );
}
