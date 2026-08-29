"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/account/AuthProvider";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName);
      }
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-md px-6 py-16">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
        <h1 className="mt-2 text-center font-display text-4xl italic tracking-tight text-ink">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>

        <div className="mt-8 flex rounded-full border border-line bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
              mode === "login" ? "bg-purple-600 text-white" : "text-ink-soft"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
              mode === "register" ? "bg-purple-600 text-white" : "text-ink-soft"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl border border-line bg-white p-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
              {error}
            </div>
          )}

          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-soft">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-soft">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 6 : undefined}
              className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-purple-600 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-soft">
          <Link href="/shop" className="hover:text-purple-700 hover:underline">
            Continue browsing without an account
          </Link>
        </p>
      </section>
    </main>
  );
}
